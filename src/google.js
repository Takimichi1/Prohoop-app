// ─── Google Drive + Sheets Integration ───────────────────────────────────────
// Uses Google Identity Services (GIS) + Google Sheets API v4
// All data is saved to a Google Sheet in the user's own Drive

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';
const SHEET_NAME = 'ProHoop Tracker';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// ── You MUST fill these in from Google Cloud Console ──────────────────────────
// 1. Go to console.cloud.google.com
// 2. Create project → Enable "Google Sheets API" + "Google Drive API"
// 3. OAuth 2.0 → Create credentials → Web app → add your site URL to origins
// 4. Also create an API Key → restrict to Sheets API
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
};
// ─────────────────────────────────────────────────────────────────────────────

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let accessToken = null;
let spreadsheetId = null;

export function isConfigured() {
  return GOOGLE_CONFIG.CLIENT_ID !== 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
}

export async function initGoogleAPI() {
  return new Promise((resolve, reject) => {
    // Load GAPI
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: GOOGLE_CONFIG.API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        if (gisInited) resolve();
      });
    };
    gapiScript.onerror = reject;
    document.head.appendChild(gapiScript);

    // Load GIS
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) return;
          accessToken = resp.access_token;
          window.gapi.client.setToken({ access_token: accessToken });
        },
      });
      gisInited = true;
      if (gapiInited) resolve();
    };
    gisScript.onerror = reject;
    document.head.appendChild(gisScript);
  });
}

export function signIn() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject(new Error('GIS not initialized')); return; }
    tokenClient.callback = (resp) => {
      if (resp.error) { reject(resp); return; }
      accessToken = resp.access_token;
      window.gapi.client.setToken({ access_token: accessToken });
      localStorage.setItem('prohoop_signed_in', '1');
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

export function signOut() {
  if (accessToken) window.google.accounts.oauth2.revoke(accessToken);
  accessToken = null;
  spreadsheetId = null;
  localStorage.removeItem('prohoop_signed_in');
  localStorage.removeItem('prohoop_sheet_id');
}

export function isSignedIn() {
  return !!accessToken;
}

// ── Find or create the ProHoop spreadsheet ───────────────────────────────────
async function getOrCreateSheet() {
  if (spreadsheetId) return spreadsheetId;
  const saved = localStorage.getItem('prohoop_sheet_id');
  if (saved) { spreadsheetId = saved; return spreadsheetId; }

  // Search Drive for existing sheet
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${SHEET_NAME}'+and+mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    spreadsheetId = data.files[0].id;
    localStorage.setItem('prohoop_sheet_id', spreadsheetId);
    return spreadsheetId;
  }

  // Create new spreadsheet
  const created = await window.gapi.client.sheets.spreadsheets.create({
    properties: { title: SHEET_NAME },
    sheets: [
      { properties: { title: 'Sessions' } },
      { properties: { title: 'Shot Logs' } },
      { properties: { title: 'Rep Logs' } },
    ],
  });

  spreadsheetId = created.result.spreadsheetId;
  localStorage.setItem('prohoop_sheet_id', spreadsheetId);

  // Add headers
  await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: 'RAW',
      data: [
        { range: 'Sessions!A1:F1', values: [['Date', 'Day', 'Label', 'Exercises Done', 'Total Exercises', 'Completion %']] },
        { range: 'Shot Logs!A1:F1', values: [['Date', 'Day', 'Exercise', 'Makes', 'Attempts', 'FG%']] },
        { range: 'Rep Logs!A1:F1', values: [['Date', 'Day', 'Exercise', 'Sets Done', 'Total Sets', 'Total Reps']] },
      ]
    }
  });

  return spreadsheetId;
}

// ── Save a completed session ─────────────────────────────────────────────────
export async function saveSession({ day, label, exercises, trackerState }) {
  if (!accessToken) throw new Error('Not signed in');
  const sheetId = await getOrCreateSheet();
  const now = new Date().toLocaleDateString('en-GB');

  let done = 0;
  const shotRows = [];
  const repRows = [];

  exercises.forEach((ex, idx) => {
    const s = trackerState[idx] || {};
    let exDone = false;

    if (ex.trackerType === 'check' && s.done) { done++; exDone = true; }
    else if (ex.trackerType === 'reps' && s.completedSets >= ex.sets) { done++; exDone = true; }
    else if (ex.trackerType === 'time' && s.completedSets >= ex.sets) { done++; exDone = true; }
    else if (ex.trackerType === 'shot' && s.makes >= (ex.targetReps || 1)) { done++; exDone = true; }

    if (ex.trackerType === 'shot' && s.attempts > 0) {
      const fg = Math.round((s.makes / s.attempts) * 100);
      shotRows.push([now, day, ex.name, s.makes, s.attempts, `${fg}%`]);
    }
    if (ex.trackerType === 'reps' && s.completedSets > 0) {
      const totalReps = Object.values(s.repLog || {}).reduce((a, b) => a + b, 0);
      repRows.push([now, day, ex.name, s.completedSets, ex.sets, totalReps]);
    }
  });

  const pct = exercises.length > 0 ? Math.round((done / exercises.length) * 100) : 0;
  const updates = [
    { range: 'Sessions!A:F', values: [[now, day, label, done, exercises.length, `${pct}%`]] },
    ...(shotRows.length > 0 ? [{ range: 'Shot Logs!A:F', values: shotRows }] : []),
    ...(repRows.length > 0 ? [{ range: 'Rep Logs!A:F', values: repRows }] : []),
  ];

  for (const u of updates) {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: u.range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: u.values },
    });
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}`;
}

// ── Load past sessions for history ──────────────────────────────────────────
export async function loadHistory() {
  if (!accessToken) return [];
  try {
    const sheetId = await getOrCreateSheet();
    const res = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sessions!A2:F',
    });
    return (res.result.values || []).reverse().slice(0, 20); // last 20
  } catch { return []; }
}

export async function loadShotHistory() {
  if (!accessToken) return [];
  try {
    const sheetId = await getOrCreateSheet();
    const res = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Shot Logs!A2:F',
    });
    return (res.result.values || []).reverse().slice(0, 30);
  } catch { return []; }
}
