import { useState, useEffect, useCallback } from "react";
import { schedule } from "./schedule.js";
import { RepTracker, ShotTracker, TimeTracker, CheckTracker } from "./Trackers.jsx";
import WorkoutTimer from "./WorkoutTimer";
import TrainingCalendar from "./TrainingCalendar";
import {
  isConfigured, initGoogleAPI, signIn, signOut, isSignedIn,
  saveSession, loadHistory, loadShotHistory, GOOGLE_CONFIG,
} from "./google.js";

// ── helpers ───────────────────────────────────────────────────────────────────
const todayDayIndex = () => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;   // Mon=0 … Sun=6
};

const isExDone = (ex, s) => {
  if (!s) return false;
  if (ex.trackerType === "check") return !!s.done;
  if (ex.trackerType === "reps") return s.completedSets >= ex.sets;
  if (ex.trackerType === "time") return s.completedSets >= ex.sets;
  if (ex.trackerType === "shot") return s.makes >= (ex.targetReps || 1);
  return false;
};

// ── GoogleSync banner ─────────────────────────────────────────────────────────
function SyncBanner({ syncing, lastSync, error, onSave, onSignOut, signedIn }) {
  if (!isConfigured()) return (
    <div style={{ background: "#1a1200", borderBottom: "1px solid #ff990033", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "12px", color: "#ff9900", fontFamily: "Barlow Condensed", fontWeight: 600 }}>
        ⚠️ Add your Google Client ID + API Key in <code style={{ fontSize: "11px", color: "#ffbb44" }}>src/google.js</code> to enable Drive sync
      </span>
    </div>
  );

  return (
    <div style={{ background: signedIn ? "#001a08" : "#0a0a14", borderBottom: `1px solid ${signedIn ? "#00ff4422" : "#ffffff12"}`, padding: "7px 16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: signedIn ? "#00cc55" : "#444", flexShrink: 0 }} />
      <span style={{ fontSize: "11px", color: signedIn ? "#00cc55" : "#444", fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "1px", flex: 1 }}>
        {signedIn ? (lastSync ? `SYNCED ${lastSync}` : "GOOGLE DRIVE CONNECTED") : "NOT CONNECTED TO DRIVE"}
      </span>
      {error && <span style={{ fontSize: "10px", color: "#ff4444", fontFamily: "Barlow" }}>{error}</span>}
      {signedIn ? (
        <>
          <button onClick={onSave} disabled={syncing} style={{ background: syncing ? "#004422" : "#00cc55", border: "none", borderRadius: "3px", color: syncing ? "#007733" : "#000", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "10px", letterSpacing: "1px", padding: "3px 10px", cursor: syncing ? "default" : "pointer" }}>
            {syncing ? "SAVING..." : "💾 SAVE SESSION"}
          </button>
          <button onClick={onSignOut} style={{ background: "none", border: "1px solid #ffffff15", borderRadius: "3px", color: "#444", fontFamily: "Barlow Condensed", fontSize: "10px", padding: "2px 8px", cursor: "pointer" }}>SIGN OUT</button>
        </>
      ) : (
        <button onClick={onSave} style={{ background: "#4285f4", border: "none", borderRadius: "3px", color: "#fff", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "10px", letterSpacing: "1px", padding: "3px 10px", cursor: "pointer" }}>
          🔗 SIGN IN WITH GOOGLE
        </button>
      )}
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────
function HistoryTab({ color }) {
  const [sessions, setSessions] = useState(null);
  const [shots, setShots] = useState(null);
  const [tab, setTab] = useState("sessions");

  useEffect(() => {
    if (!isSignedIn()) { setSessions([]); setShots([]); return; }
    loadHistory().then(setSessions);
    loadShotHistory().then(setShots);
  }, []);

  if (!isConfigured()) return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontFamily: "Barlow Condensed", fontSize: "14px" }}>
      Connect Google Drive to see history
    </div>
  );

  if (!isSignedIn()) return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontFamily: "Barlow Condensed", fontSize: "14px" }}>
      Sign in to Google Drive to view session history
    </div>
  );

  if (sessions === null) return <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontFamily: "Barlow Condensed" }}>Loading history...</div>;

  return (
    <div style={{ padding: "14px 16px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {["sessions", "shots"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? color + "1a" : "none",
            border: `1px solid ${tab === t ? color : "#ffffff12"}`,
            borderRadius: "3px", padding: "4px 12px",
            color: tab === t ? color : "#444",
            fontFamily: "Barlow Condensed", fontWeight: 700,
            fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>

      {tab === "sessions" && (
        sessions.length === 0
          ? <div style={{ color: "#444", fontFamily: "Barlow Condensed", fontSize: "13px", textAlign: "center", padding: "30px" }}>No sessions saved yet. Complete a workout and hit Save!</div>
          : sessions.map((row, i) => {
              const pct = parseInt(row[5]) || 0;
              return (
                <div key={i} style={{ padding: "12px 14px", background: "#ffffff04", border: "1px solid #ffffff08", borderRadius: "4px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "14px", color: "#ddd" }}>{row[1]} — {row[2]}</div>
                    <div style={{ fontFamily: "Barlow", fontSize: "11px", color: "#555", marginTop: "2px" }}>{row[0]} · {row[3]}/{row[4]} exercises</div>
                  </div>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: `conic-gradient(${color} ${pct * 3.6}deg, #1e1e2a 0deg)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "9px", color }}>
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })
      )}

      {tab === "shots" && (
        shots.length === 0
          ? <div style={{ color: "#444", fontFamily: "Barlow Condensed", fontSize: "13px", textAlign: "center", padding: "30px" }}>No shot data yet. Log some shots on Friday or Saturday!</div>
          : shots.map((row, i) => {
              const fg = parseInt(row[5]) || 0;
              const barColor = fg >= 50 ? "#00cc55" : fg >= 35 ? color : "#cc3333";
              return (
                <div key={i} style={{ padding: "12px 14px", background: "#ffffff04", border: "1px solid #ffffff08", borderRadius: "4px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "13px", color: "#ccc" }}>{row[2]}</div>
                      <div style={{ fontFamily: "Barlow", fontSize: "10px", color: "#444" }}>{row[0]} · {row[1]}</div>
                    </div>
                    <span style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "16px", color: barColor }}>{row[5]}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <div style={{ flex: 1, height: "3px", background: "#ffffff10", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, fg)}%`, height: "100%", background: barColor }} />
                    </div>
                    <span style={{ fontFamily: "Barlow Condensed", fontSize: "10px", color: "#555" }}>{row[3]}M / {row[4]}A</span>
                  </div>
                </div>
              );
            })
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeDay, setActiveDay] = useState(todayDayIndex());
  const [expanded, setExpanded] = useState({});
  const [trackerState, setTrackerState] = useState({});
  const [mainTab, setMainTab] = useState("workout"); // workout | shots | history
  const [signedIn, setSignedIn] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);

  const day = schedule[activeDay];

  // Init Google API
  useEffect(() => {
    if (!isConfigured()) return;
    initGoogleAPI()
      .then(() => {
        setGapiReady(true);
        // Try silent sign-in if previously authed
        if (localStorage.getItem('prohoop_signed_in')) {
          signIn().then(() => setSignedIn(true)).catch(() => {});
        }
      })
      .catch(console.error);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const setExState = (tKey, val) => setTrackerState(prev => ({ ...prev, [tKey]: val }));
  const toggleBlock = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // Progress
  const getDayProgress = () => {
    let done = 0, total = 0;
    day.workouts.forEach((block, bi) => {
      (block.exercises || []).forEach((ex, ei) => {
        total++;
        if (isExDone(ex, trackerState[`${activeDay}-${bi}-${ei}`])) done++;
      });
    });
    return { done, total };
  };

  const { done: dayDone, total: dayTotal } = getDayProgress();
  const dayPct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

  // Shot stats
  const shotStats = [];
  day.workouts.forEach((block, bi) => {
    (block.exercises || []).forEach((ex, ei) => {
      if (ex.trackerType === "shot") {
        const s = trackerState[`${activeDay}-${bi}-${ei}`] || { makes: 0, attempts: 0 };
        if (s.attempts > 0) shotStats.push({ name: ex.name, ...s });
      }
    });
  });
  const totalMakes = shotStats.reduce((a, s) => a + s.makes, 0);
  const totalAttempts = shotStats.reduce((a, s) => a + s.attempts, 0);
  const overallFG = totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : 0;
  const hasShotDay = day.workouts.some(b => (b.exercises || []).some(e => e.trackerType === "shot"));

  // Save to Drive
  const handleSave = async () => {
    if (!isConfigured()) return;
    if (!signedIn) {
      setSyncError(null);
      try {
        await signIn();
        setSignedIn(true);
      } catch { setSyncError("Sign-in failed"); return; }
    }
    setSyncing(true);
    setSyncError(null);
    try {
      const allExercises = day.workouts.flatMap((b, bi) =>
        (b.exercises || []).map((ex, ei) => ({ ...ex, _stateKey: `${activeDay}-${bi}-${ei}` }))
      );
      const flatState = {};
      allExercises.forEach((ex, i) => { flatState[i] = trackerState[ex._stateKey]; });
      await saveSession({ day: day.day, label: day.label, exercises: allExercises, trackerState: flatState });
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      setSyncError(e.message || "Save failed");
    }
    setSyncing(false);
  };

  const handleSignOut = () => { signOut(); setSignedIn(false); setLastSync(null); };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "'Barlow Condensed', sans-serif", color: "#F0EDE8", paddingBottom: "80px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* SYNC BANNER */}
      <SyncBanner syncing={syncing} lastSync={lastSync} error={syncError}
        onSave={handleSave} onSignOut={handleSignOut} signedIn={signedIn} />

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg, #0e0e1a 0%, #0A0A0F 100%)", borderBottom: `3px solid ${day.color}`, padding: "18px 18px 12px", position: "sticky", top: syncing !== null ? "37px" : "0", zIndex: 9 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: day.color, boxShadow: `0 0 10px ${day.color}` }} />
              <span style={{ fontSize: "9px", letterSpacing: "4px", color: "#555", fontWeight: 600 }}>PROHOOP · PRO DEVELOPMENT</span>
            </div>
            <h1 style={{ fontSize: "clamp(20px, 6vw, 36px)", fontWeight: 900, letterSpacing: "-0.5px", margin: 0, lineHeight: 1.05, textTransform: "uppercase" }}>
              <span style={{ color: day.color }}>{day.day}</span>
              <br />
              <span style={{ color: "#c0bcb8", fontWeight: 700, fontSize: "0.58em", letterSpacing: "1px" }}>{day.label}</span>
            </h1>
          </div>
          {/* Progress ring */}
          <div style={{ textAlign: "center", flexShrink: 0, marginLeft: "10px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: `conic-gradient(${day.color} ${dayPct * 3.6}deg, #1c1c28 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "11px", color: day.color }}>
                {dayPct}%
              </div>
            </div>
            <div style={{ fontSize: "9px", color: "#333", marginTop: "2px", letterSpacing: "1px" }}>{dayDone}/{dayTotal}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "5px", marginTop: "8px" }}>
          <span style={{ background: day.color + "20", border: `1px solid ${day.color}40`, color: day.color, fontSize: "9px", fontWeight: 700, letterSpacing: "2px", padding: "2px 8px", borderRadius: "2px" }}>{day.tag}</span>
          <span style={{ background: "#ffffff07", border: "1px solid #ffffff10", color: "#555", fontSize: "9px", fontWeight: 600, letterSpacing: "2px", padding: "2px 8px", borderRadius: "2px" }}>NEIGHBOR SAFE 🔇</span>
        </div>
      </div>

      {/* DAY SELECTOR */}
      <div style={{ display: "flex", overflowX: "auto", padding: "10px 14px 0", scrollbarWidth: "none", borderBottom: "1px solid #ffffff0c" }}>
        {schedule.map((d, i) => (
          <button key={i} onClick={() => { setActiveDay(i); setExpanded({}); setMainTab("workout"); }} style={{
            background: "none", border: "none", cursor: "pointer", padding: "5px 11px 9px",
            position: "relative", color: i === activeDay ? d.color : "#333",
            fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "11px",
            letterSpacing: "2px", textTransform: "uppercase", whiteSpace: "nowrap",
          }}>
            {d.day.slice(0, 3)}
            {i === activeDay && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: d.color, boxShadow: `0 0 6px ${d.color}` }} />}
          </button>
        ))}
      </div>

      {/* VIEW TABS */}
      <div style={{ display: "flex", padding: "10px 16px 0", gap: "6px", borderBottom: "1px solid #ffffff08" }}>
        {["workout", ...(hasShotDay ? ["shot stats"] : []), "history", "calendar", "timer"].map(tab => (
          <button key={tab} onClick={() => setMainTab(tab)} style={{
            background: mainTab === tab ? day.color + "18" : "none",
            border: `1px solid ${mainTab === tab ? day.color : "#ffffff10"}`,
            borderRadius: "3px", padding: "4px 10px",
            color: mainTab === tab ? day.color : "#333",
            fontFamily: "Barlow Condensed", fontWeight: 700,
            fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
          }}>{tab}</button>
        ))}
      </div>

      {/* ── HISTORY ── */}
      {mainTab === "history" && <HistoryTab color={day.color} />}
      {mainTab === "calendar" && <TrainingCalendar />}
      {mainTab === "timer" && <WorkoutTimer />}

      {/* ── SHOT STATS ── */}
      {mainTab === "shot stats" && (
        <div style={{ padding: "14px 16px", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ padding: "16px", background: day.color + "0c", border: `1px solid ${day.color}22`, borderRadius: "6px", marginBottom: "12px" }}>
            <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "10px", letterSpacing: "3px", color: day.color, marginBottom: "10px" }}>TODAY'S SHOOTING</div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[{ label: "MAKES", val: totalMakes, col: "#00cc55" }, { label: "ATTEMPTS", val: totalAttempts, col: "#888" }, { label: "FG%", val: `${overallFG}%`, col: day.color }].map(({ label, val, col }) => (
                <div key={label}>
                  <div style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: "30px", color: col, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: "Barlow Condensed", fontWeight: 600, fontSize: "9px", letterSpacing: "2px", color: "#333" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          {shotStats.length === 0
            ? <div style={{ color: "#333", fontFamily: "Barlow Condensed", fontSize: "13px", textAlign: "center", padding: "30px" }}>Log shots in the Workout tab first</div>
            : shotStats.map((s, i) => {
                const fg = s.attempts > 0 ? Math.round((s.makes / s.attempts) * 100) : 0;
                const bc = fg >= 50 ? "#00cc55" : fg >= 35 ? day.color : "#cc3333";
                return (
                  <div key={i} style={{ padding: "11px 14px", background: "#ffffff03", border: "1px solid #ffffff07", borderRadius: "4px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "13px", color: "#bbb" }}>{s.name}</span>
                      <span style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "14px", color: bc }}>{fg}%</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div style={{ flex: 1, height: "3px", background: "#ffffff0e", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${fg}%`, height: "100%", background: bc }} />
                      </div>
                      <span style={{ fontFamily: "Barlow Condensed", fontSize: "10px", color: "#444" }}>{s.makes}M / {s.attempts}A</span>
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* ── WORKOUT ── */}
      {mainTab === "workout" && (
        <div style={{ padding: "12px 16px", maxWidth: "700px", margin: "0 auto" }}>
          {day.workouts.map((block, bi) => {
            const key = `${activeDay}-${bi}`;
            const isOpen = expanded[key] !== false;
            const exs = block.exercises || [];
            const blockDone = exs.filter((ex, ei) => isExDone(ex, trackerState[`${activeDay}-${bi}-${ei}`])).length;

            return (
              <div key={bi} style={{ marginBottom: "9px" }}>
                <button onClick={() => toggleBlock(key)} style={{
                  width: "100%", background: "#ffffff04", border: "1px solid #ffffff0e",
                  borderLeft: `3px solid ${day.color}`, borderRadius: isOpen ? "4px 4px 0 0" : "4px",
                  padding: "11px 14px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", cursor: "pointer", color: "#E0DCD8",
                  fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "12px",
                  letterSpacing: "1.5px", textTransform: "uppercase", textAlign: "left",
                }}>
                  <span>{block.category}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", color: blockDone === exs.length ? day.color : "#333", fontWeight: 700 }}>{blockDone}/{exs.length}</span>
                    <span style={{ color: day.color, fontSize: "14px" }}>{isOpen ? "−" : "+"}</span>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ border: "1px solid #ffffff08", borderTop: "none", borderRadius: "0 0 4px 4px" }}>
                    {exs.map((ex, ei) => {
                      const tKey = `${activeDay}-${bi}-${ei}`;
                      const exState = trackerState[tKey];
                      const done = isExDone(ex, exState);
                      return (
                        <div key={ei} style={{
                          padding: "11px 14px",
                          borderBottom: ei < exs.length - 1 ? "1px solid #ffffff07" : "none",
                          background: done ? day.color + "08" : ei % 2 === 0 ? "#ffffff02" : "transparent",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1, paddingRight: "10px" }}>
                              <div style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "13px", color: done ? day.color : "#DDD9D4", display: "flex", alignItems: "center", gap: "5px" }}>
                                {done && "✓"} {ex.name}
                              </div>
                              <div style={{ fontFamily: "Barlow", fontSize: "11px", color: "#555", marginTop: "3px", lineHeight: 1.4, fontWeight: 300 }}>{ex.note}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              {ex.sets > 1 && <div style={{ background: day.color + "18", border: `1px solid ${day.color}30`, color: day.color, padding: "1px 6px", borderRadius: "2px", fontSize: "9px", fontFamily: "Barlow Condensed", fontWeight: 700, marginBottom: "3px" }}>{ex.sets}×</div>}
                              <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", color: "#999", padding: "1px 6px", borderRadius: "2px", fontSize: "9px", fontFamily: "Barlow Condensed", fontWeight: 600, whiteSpace: "nowrap" }}>{ex.reps}</div>
                            </div>
                          </div>

                          {ex.trackerType === "reps" && <RepTracker color={day.color} sets={ex.sets} targetReps={ex.targetReps} state={exState} setState={v => setExState(tKey, v)} />}
                          {ex.trackerType === "shot" && <ShotTracker color={day.color} targetReps={ex.targetReps} state={exState} setState={v => setExState(tKey, v)} />}
                          {ex.trackerType === "time" && <TimeTracker color={day.color} sets={ex.sets} targetReps={ex.targetReps} state={exState} setState={v => setExState(tKey, v)} />}
                          {ex.trackerType === "check" && <CheckTracker color={day.color} state={exState} setState={v => setExState(tKey, v)} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: "16px", padding: "14px", background: "#ffffff04", border: `1px solid ${day.color}1a`, borderLeft: `3px solid ${day.color}`, borderRadius: "4px" }}>
            <div style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "10px", letterSpacing: "3px", color: day.color, marginBottom: "9px" }}>📋 PROGRAM NOTES</div>
            <div style={{ fontFamily: "Barlow", fontSize: "11px", color: "#666", lineHeight: 1.7, fontWeight: 300 }}>
              <p style={{ margin: "0 0 4px" }}>• <strong style={{ color: "#aaa" }}>Target:</strong> 90–95kg lean over 18 months. Mobility &gt; mass for forwards.</p>
              <p style={{ margin: "0 0 4px" }}>• <strong style={{ color: "#aaa" }}>Noise rule:</strong> Soft landing on all jumps. Yoga mat or carpet only.</p>
              <p style={{ margin: "0 0 4px" }}>• <strong style={{ color: "#aaa" }}>Protein:</strong> 180–200g/day. Eat within 30 min of training.</p>
              <p style={{ margin: "0" }}>• <strong style={{ color: "#aaa" }}>Saturday is mandatory court time.</strong> Film yourself. Track shot %.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
