// services/googleDrive.js
// Handles OAuth2 login and saving workout sessions to Google Sheets

import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// ─── REPLACE THIS WITH YOUR CLIENT ID FROM GOOGLE CLOUD CONSOLE ───────────────
// See SETUP.md for step-by-step instructions
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
// ─────────────────────────────────────────────────────────────────────────────

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const SPREADSHEET_NAME = 'Basketball Pro Trainer Log';
const TOKEN_KEY = 'google_access_token';
const SHEET_ID_KEY = 'google_sheet_id';

// ── AUTH ──────────────────────────────────────────────────────────────────────
export function useGoogleAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'bballprotrainer' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  return { request, response, promptAsync };
}

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(SHEET_ID_KEY);
}

// ── SPREADSHEET HELPERS ───────────────────────────────────────────────────────
async function authFetch(url, options = {}) {
  const token = await getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Google API error');
  }
  return res.json();
}

async function getOrCreateSpreadsheet() {
  // Check if we already know the sheet ID
  const stored = await SecureStore.getItemAsync(SHEET_ID_KEY);
  if (stored) return stored;

  // Search for existing sheet
  const search = await authFetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)`
  );

  if (search.files && search.files.length > 0) {
    const id = search.files[0].id;
    await SecureStore.setItemAsync(SHEET_ID_KEY, id);
    return id;
  }

  // Create a new spreadsheet
  const created = await authFetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      body: JSON.stringify({
        properties: { title: SPREADSHEET_NAME },
        sheets: [
          {
            properties: { title: 'Sessions' },
            data: [{
              startRow: 0, startColumn: 0,
              rowData: [{
                values: [
                  'Date', 'Day', 'Exercise', 'Category', 'Type',
                  'Sets Done', 'Reps Done', 'Makes', 'Attempts', 'FG%', 'Notes'
                ].map(v => ({ userEnteredValue: { stringValue: v } })),
              }],
            }],
          },
        ],
      }),
    }
  );

  await SecureStore.setItemAsync(SHEET_ID_KEY, created.spreadsheetId);
  return created.spreadsheetId;
}

// ── SAVE SESSION ──────────────────────────────────────────────────────────────
/**
 * Save a completed workout session to Google Sheets.
 *
 * @param {Object} params
 * @param {string} params.dayName - e.g. "Monday"
 * @param {Object} params.trackerState - full tracker state from the workout screen
 * @param {Array}  params.schedule - the SCHEDULE array
 */
export async function saveSessionToSheets({ dayName, trackerState, schedule }) {
  const spreadsheetId = await getOrCreateSpreadsheet();
  const dayIndex = schedule.findIndex(d => d.day === dayName);
  if (dayIndex === -1) throw new Error('Day not found');

  const day = schedule[dayIndex];
  const date = new Date().toLocaleDateString('en-GB');
  const rows = [];

  day.workouts.forEach((block, bi) => {
    (block.exercises || []).forEach((ex, ei) => {
      const tKey = `${dayIndex}-${bi}-${ei}`;
      const s = trackerState[tKey];
      if (!s) return; // not touched

      let setsDone = '', repsDone = '', makes = '', attempts = '', fg = '';

      if (ex.trackerType === 'reps') {
        setsDone = s.completedSets;
        repsDone = Object.values(s.repLog || {}).reduce((a, b) => a + b, 0);
      } else if (ex.trackerType === 'time') {
        setsDone = s.completedSets;
        repsDone = `${s.completedSets * (ex.targetReps || 0)}s`;
      } else if (ex.trackerType === 'shot') {
        makes = s.makes || 0;
        attempts = s.attempts || 0;
        fg = attempts > 0 ? `${Math.round((makes / attempts) * 100)}%` : '';
      } else if (ex.trackerType === 'check') {
        setsDone = s.done ? '✓' : '';
      }

      rows.push([
        date, dayName, ex.name, block.category,
        ex.trackerType, setsDone, repsDone, makes, attempts, fg, ex.note,
      ]);
    });
  });

  if (rows.length === 0) return { saved: 0 };

  await authFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions!A:K:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({ values: rows }),
    }
  );

  return { saved: rows.length, spreadsheetId };
}

// ── FETCH HISTORY ─────────────────────────────────────────────────────────────
export async function fetchHistory() {
  const spreadsheetId = await getOrCreateSpreadsheet();
  const data = await authFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions!A:K`
  );

  const rows = data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}
