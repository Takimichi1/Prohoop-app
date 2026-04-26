# ProHoop – Setup Guide

A real Android-installable PWA that syncs your basketball workouts to Google Drive.

---

## 1. Install Node.js (if you don't have it)

Go to https://nodejs.org → download LTS → install it.

Check it works:
```
node --version
npm --version
```

---

## 2. Set up the project

Copy the `prohoop` folder somewhere on your computer, then:

```bash
cd prohoop
npm install
```

---

## 3. Get Google API credentials

You need two things from Google Cloud:

### Step 1 — Create a project
1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project** → name it "ProHoop" → Create

### Step 2 — Enable APIs
1. Go to **APIs & Services** → **Enable APIs and Services**
2. Search and enable: **Google Sheets API**
3. Search and enable: **Google Drive API**

### Step 3 — Create OAuth 2.0 Client ID
1. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: ProHoop
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for testing)
   - Your deployed URL (e.g. `https://prohoop.netlify.app`) when you deploy
5. Copy the **Client ID** — it looks like `123456789-abc.apps.googleusercontent.com`

### Step 4 — Create an API Key
1. **Create Credentials** → **API Key**
2. Click **Restrict Key** → under API restrictions, select **Google Sheets API**
3. Copy the key

### Step 5 — Paste them into the app
Open `src/google.js` and replace:

```js
CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
API_KEY: 'YOUR_API_KEY_HERE',
```

---

## 4. Run the app locally

```bash
npm run dev
```

Open http://localhost:3000 in Chrome on your computer.

To test on your Android phone on the same WiFi:
```bash
# find your computer's local IP
ipconfig   # Windows
ifconfig   # Mac/Linux
```
Then open `http://YOUR_IP:3000` in Chrome on your phone.

---

## 5. Install on Android (make it a real app)

1. Open the app in **Chrome** on your Android
2. Tap the **3-dot menu** (top right)
3. Tap **"Add to Home screen"** or **"Install app"**
4. It will appear on your home screen like a real app, no app store needed ✅

---

## 6. Deploy it online (so you can access it anywhere)

### Free option — Netlify

1. Go to https://netlify.com → sign up free
2. Run `npm run build` — this creates a `dist/` folder
3. Drag the `dist/` folder onto Netlify's deploy page
4. You get a URL like `https://prohoop.netlify.app`
5. Add this URL to your OAuth 2.0 Client ID's **Authorized JavaScript origins** in Google Cloud Console

---

## How the Google Drive sync works

- First time you tap **SIGN IN WITH GOOGLE**, it opens Google OAuth
- A Google Sheet called **"ProHoop Tracker"** is auto-created in your Drive
- It has 3 tabs: **Sessions**, **Shot Logs**, **Rep Logs**
- Every time you tap **💾 SAVE SESSION**, it appends your data
- View it anytime at drive.google.com

---

## File structure

```
prohoop/
├── public/
│   ├── index.html          ← PWA shell
│   ├── manifest.json       ← Makes it installable on Android
│   └── sw.js               ← Offline support (service worker)
├── src/
│   ├── main.jsx            ← Entry point
│   ├── App.jsx             ← Main app + Google Drive sync
│   ├── Trackers.jsx        ← Rep/Shot/Time/Check tracker components
│   ├── schedule.js         ← All workout data
│   └── google.js           ← Google Drive + Sheets API integration
├── vite.config.js
└── package.json
```
