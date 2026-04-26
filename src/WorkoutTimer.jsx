import { useState, useEffect, useRef } from "react";

export default function WorkoutTimer() {
  const [mode, setMode] = useState("stopwatch"); // stopwatch | countdown
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0); // ms
  const [countdownStart, setCountdownStart] = useState(60);
  const [sets, setSets] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [restMode, setRestMode] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [restRemaining, setRestRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (restMode) {
          setRestRemaining(prev => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              setRunning(false);
              setRestMode(false);
              return 0;
            }
            return prev - 1;
          });
        } else if (mode === "stopwatch") {
          setTime(prev => prev + 100);
        } else {
          setTime(prev => {
            if (prev <= 0) {
              clearInterval(intervalRef.current);
              setRunning(false);
              return 0;
            }
            return prev - 100;
          });
        }
      }, 100);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, restMode]);

  const formatTime = (ms) => {
    const totalSecs = Math.floor(Math.abs(ms) / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);

  const handleSetDone = () => {
    setRunning(false);
    setCompletedSets(prev => prev + 1);
    setTime(mode === "countdown" ? countdownStart * 1000 : 0);
    if (completedSets + 1 < sets) {
      setRestRemaining(restTime);
      setRestMode(true);
      setRunning(true);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setRestMode(false);
    setCompletedSets(0);
    setTime(mode === "countdown" ? countdownStart * 1000 : 0);
    setRestRemaining(0);
  };

  const progress = restMode
    ? (restRemaining / restTime) * 100
    : mode === "countdown"
    ? (time / (countdownStart * 1000)) * 100
    : 0;

  const s = {
    wrap: { padding: "20px 16px", fontFamily: "Barlow Condensed, sans-serif", color: "#fff", minHeight: "100vh", background: "#0a0f1e" },
    title: { fontSize: 22, fontWeight: 800, letterSpacing: 3, color: "#FF6B35", marginBottom: 20 },
    modeRow: { display: "flex", gap: 8, marginBottom: 24 },
    modeBtn: (active) => ({ flex: 1, padding: "8px 0", border: `1px solid ${active ? "#FF6B35" : "#333"}`, background: active ? "#FF6B35" : "transparent", color: active ? "#000" : "#aaa", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer", borderRadius: 4 }),
    card: { background: "#111827", borderRadius: 12, padding: "24px 20px", marginBottom: 16 },
    timerDisplay: { fontSize: restMode ? 48 : 72, fontWeight: 900, textAlign: "center", color: restMode ? "#4FC3F7" : "#fff", letterSpacing: 4, lineHeight: 1 },
    label: { textAlign: "center", fontSize: 11, letterSpacing: 3, color: restMode ? "#4FC3F7" : "#666", marginTop: 6, marginBottom: 16 },
    progressBar: { height: 3, background: "#1e293b", borderRadius: 2, marginBottom: 20, overflow: "hidden" },
    progressFill: { height: "100%", background: restMode ? "#4FC3F7" : "#FF6B35", width: `${progress}%`, transition: "width 0.1s" },
    btnRow: { display: "flex", gap: 8 },
    btn: (color, bg) => ({ flex: 1, padding: "12px 0", background: bg || "transparent", border: `1px solid ${color}`, color: color, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2, cursor: "pointer", borderRadius: 6 }),
    configRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    configLabel: { fontSize: 12, letterSpacing: 2, color: "#888" },
    configVal: { display: "flex", alignItems: "center", gap: 10 },
    adjBtn: { width: 28, height: 28, background: "#1e293b", border: "1px solid #333", color: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },
    setsRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 },
    setDot: (done) => ({ width: 10, height: 10, borderRadius: "50%", background: done ? "#FF6B35" : "#1e293b", border: "1px solid #333" }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.title}>WORKOUT TIMER</div>

      <div style={s.modeRow}>
        <button style={s.modeBtn(mode === "stopwatch")} onClick={() => { setMode("stopwatch"); handleReset(); }}>STOPWATCH</button>
        <button style={s.modeBtn(mode === "countdown")} onClick={() => { setMode("countdown"); setTime(countdownStart * 1000); handleReset(); }}>COUNTDOWN</button>
      </div>

      <div style={s.card}>
        <div style={s.timerDisplay}>
          {restMode ? formatTime(restRemaining * 1000) : formatTime(time)}
        </div>
        <div style={s.label}>{restMode ? "REST" : mode === "countdown" ? "WORK" : "ELAPSED"}</div>
        {(mode === "countdown" || restMode) && (
          <div style={s.progressBar}><div style={s.progressFill} /></div>
        )}
        <div style={s.btnRow}>
          {!running ? (
            <button style={s.btn("#FF6B35", "#FF6B3522")} onClick={handleStart}>▶ START</button>
          ) : (
            <button style={s.btn("#facc15", "#facc1522")} onClick={handlePause}>⏸ PAUSE</button>
          )}
          <button style={s.btn("#4FC3F7", "#4FC3F722")} onClick={handleSetDone} disabled={completedSets >= sets}>✓ SET DONE</button>
          <button style={s.btn("#666")} onClick={handleReset}>↺</button>
        </div>
      </div>

      <div style={s.card}>
        {mode === "countdown" && (
          <div style={s.configRow}>
            <span style={s.configLabel}>WORK (SEC)</span>
            <div style={s.configVal}>
              <button style={s.adjBtn} onClick={() => setCountdownStart(p => Math.max(5, p - 5))}>−</button>
              <span style={{ fontWeight: 700, minWidth: 30, textAlign: "center" }}>{countdownStart}</span>
              <button style={s.adjBtn} onClick={() => setCountdownStart(p => p + 5)}>+</button>
            </div>
          </div>
        )}
        <div style={s.configRow}>
          <span style={s.configLabel}>REST (SEC)</span>
          <div style={s.configVal}>
            <button style={s.adjBtn} onClick={() => setRestTime(p => Math.max(5, p - 5))}>−</button>
            <span style={{ fontWeight: 700, minWidth: 30, textAlign: "center" }}>{restTime}</span>
            <button style={s.adjBtn} onClick={() => setRestTime(p => p + 5)}>+</button>
          </div>
        </div>
        <div style={s.configRow}>
          <span style={s.configLabel}>SETS</span>
          <div style={s.configVal}>
            <button style={s.adjBtn} onClick={() => setSets(p => Math.max(1, p - 1))}>−</button>
            <span style={{ fontWeight: 700, minWidth: 30, textAlign: "center" }}>{sets}</span>
            <button style={s.adjBtn} onClick={() => setSets(p => p + 1)}>+</button>
          </div>
        </div>
        <div style={s.setsRow}>
          {Array.from({ length: sets }).map((_, i) => (
            <div key={i} style={s.setDot(i < completedSets)} />
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#666", letterSpacing: 2 }}>
          {completedSets}/{sets} SETS COMPLETED
        </div>
      </div>
    </div>
  );
}
