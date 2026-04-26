import { useState, useEffect, useRef } from "react";

const btn = (extra) => ({
  border: "none", borderRadius: "4px", cursor: "pointer",
  fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "11px",
  letterSpacing: "1px", padding: "4px 12px", ...extra,
});

export function RepTracker({ color, sets, targetReps, state, setState }) {
  const s = state || { completedSets: 0, repLog: {} };
  const currentSet = s.completedSets;
  const currentReps = s.repLog[currentSet] || 0;
  const totalDone = Object.values(s.repLog).reduce((a, b) => a + b, 0);
  const totalTarget = sets * targetReps;
  const pct = Math.min(100, Math.round((totalDone / totalTarget) * 100));
  const allDone = s.completedSets >= sets;

  const addRep = () => {
    if (allDone) return;
    const newReps = currentReps + 1;
    const newLog = { ...s.repLog, [currentSet]: newReps };
    let newCompleted = s.completedSets;
    if (newReps >= targetReps) newCompleted = currentSet + 1;
    setState({ completedSets: newCompleted, repLog: newLog });
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
        <div style={{ flex: 1, height: "3px", background: "#ffffff10", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: "10px", color: "#555", fontFamily: "Barlow Condensed", fontWeight: 600 }}>{totalDone}/{totalTarget}</span>
      </div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
        {Array.from({ length: sets }).map((_, i) => {
          const isDone = i < s.completedSets;
          const isActive = i === s.completedSets && !allDone;
          const r = s.repLog[i] || 0;
          return (
            <div key={i} style={{
              padding: "2px 7px", borderRadius: "3px", fontSize: "10px",
              fontFamily: "Barlow Condensed", fontWeight: 700,
              border: `1px solid ${isDone ? color : isActive ? color + "55" : "#ffffff12"}`,
              background: isDone ? color + "25" : "transparent",
              color: isDone ? color : isActive ? "#aaa" : "#333",
            }}>
              {isDone ? `S${i+1}✓` : isActive ? `S${i+1} ${r}/${targetReps}` : `S${i+1}`}
            </div>
          );
        })}
        {!allDone
          ? <button onClick={addRep} style={btn({ background: color, color: "#000" })}>+1 REP</button>
          : <span style={{ color, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "12px" }}>✓ DONE!</span>
        }
        <button onClick={() => setState({ completedSets: 0, repLog: {} })}
          style={btn({ background: "none", border: "1px solid #ffffff12", color: "#333", padding: "3px 8px" })}>↺</button>
      </div>
    </div>
  );
}

export function ShotTracker({ color, targetReps, state, setState }) {
  const s = state || { makes: 0, attempts: 0 };
  const pct = s.attempts > 0 ? Math.round((s.makes / s.attempts) * 100) : 0;
  const progress = Math.min(100, Math.round((s.makes / targetReps) * 100));

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
        <div style={{ flex: 1, height: "3px", background: "#ffffff10", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: color, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: "10px", color: "#555", fontFamily: "Barlow Condensed", fontWeight: 600 }}>{s.makes}/{targetReps} makes</span>
      </div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ padding: "3px 8px", borderRadius: "3px", background: "#00ff8812", border: "1px solid #00ff8828", color: "#00cc66", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "11px" }}>🟢 {s.makes}</div>
        <div style={{ padding: "3px 8px", borderRadius: "3px", background: "#ff444412", border: "1px solid #ff444428", color: "#ee5555", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "11px" }}>🔴 {s.attempts - s.makes}</div>
        <div style={{ padding: "3px 8px", borderRadius: "3px", background: color + "15", border: `1px solid ${color}30`, color, fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "11px" }}>{pct}% FG</div>
        <button onClick={() => setState({ makes: s.makes + 1, attempts: s.attempts + 1 })}
          style={btn({ background: "#00aa55", color: "#fff" })}>✓ MAKE</button>
        <button onClick={() => setState({ makes: s.makes, attempts: s.attempts + 1 })}
          style={btn({ background: "#cc2222", color: "#fff" })}>✗ MISS</button>
        <button onClick={() => setState({ makes: 0, attempts: 0 })}
          style={btn({ background: "none", border: "1px solid #ffffff12", color: "#333", padding: "3px 8px" })}>↺</button>
      </div>
    </div>
  );
}

export function TimeTracker({ color, sets, targetReps, state, setState }) {
  const s = state || { completedSets: 0 };
  const allDone = s.completedSets >= sets;
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
        {Array.from({ length: sets }).map((_, i) => {
          const isDone = i < s.completedSets;
          return (
            <div key={i} style={{
              padding: "2px 7px", borderRadius: "3px", fontSize: "10px",
              fontFamily: "Barlow Condensed", fontWeight: 700,
              border: `1px solid ${isDone ? color : "#ffffff12"}`,
              background: isDone ? color + "25" : "transparent",
              color: isDone ? color : "#333",
            }}>
              {isDone ? `S${i+1}✓` : `S${i+1} ${targetReps}s`}
            </div>
          );
        })}
        {!allDone
          ? <button onClick={() => setState({ completedSets: s.completedSets + 1 })}
              style={btn({ background: color, color: "#000" })}>✓ SET DONE</button>
          : <span style={{ color, fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "12px" }}>✓ DONE!</span>
        }
        <button onClick={() => setState({ completedSets: 0 })}
          style={btn({ background: "none", border: "1px solid #ffffff12", color: "#333", padding: "3px 8px" })}>↺</button>
      </div>
    </div>
  );
}

export function CheckTracker({ color, state, setState }) {
  const s = state || { done: false };
  return (
    <div style={{ marginTop: "8px" }}>
      <button onClick={() => setState({ done: !s.done })} style={{
        background: s.done ? color + "20" : "#ffffff08",
        border: `1px solid ${s.done ? color : "#ffffff15"}`,
        borderRadius: "4px", padding: "5px 14px",
        color: s.done ? color : "#444",
        fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "11px",
        letterSpacing: "1px", cursor: "pointer",
      }}>
        {s.done ? "✓ COMPLETED" : "MARK DONE"}
      </button>
    </div>
  );
}
