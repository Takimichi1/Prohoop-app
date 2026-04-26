// components/Trackers.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const badge = (bg, border, color) => ({
  paddingVertical: 3, paddingHorizontal: 9, borderRadius: 4,
  backgroundColor: bg, borderWidth: 1, borderColor: border,
});
const badgeText = (color, size = 11) => ({
  color, fontWeight: '700', fontSize: size, letterSpacing: 1,
});

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  return (
    <View style={{ height: 4, backgroundColor: '#ffffff12', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <View style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

// ── REP TRACKER ───────────────────────────────────────────────────────────────
export function RepTracker({ color, sets, targetReps, state, setState }) {
  const s = state || { completedSets: 0, repLog: {} };
  const currentSet = s.completedSets;
  const currentReps = s.repLog?.[currentSet] || 0;
  const totalDone = Object.values(s.repLog || {}).reduce((a, b) => a + b, 0);
  const totalTarget = sets * targetReps;
  const pct = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;
  const allDone = s.completedSets >= sets;

  const addRep = () => {
    if (allDone) return;
    const newReps = currentReps + 1;
    const newLog = { ...s.repLog, [currentSet]: newReps };
    let newCompleted = s.completedSets;
    if (newReps >= targetReps) newCompleted = currentSet + 1;
    setState({ completedSets: newCompleted, repLog: newLog });
  };
  const reset = () => setState({ completedSets: 0, repLog: {} });

  return (
    <View style={st.trackerWrap}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <ProgressBar pct={pct} color={color} />
        <Text style={{ fontSize: 10, color: '#666', fontWeight: '600' }}>{totalDone}/{totalTarget}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {Array.from({ length: sets }).map((_, i) => {
          const setReps = s.repLog?.[i] || 0;
          const isDone = i < s.completedSets;
          const isActive = i === s.completedSets && !allDone;
          return (
            <View key={i} style={[badge(
              isDone ? color + '28' : 'transparent',
              isDone ? color : isActive ? color + '55' : '#ffffff15'
            )]}>
              <Text style={badgeText(isDone ? color : isActive ? '#bbb' : '#444')}>
                {isDone ? `S${i + 1}✓` : isActive ? `S${i + 1} ${setReps}/${targetReps}` : `S${i + 1}`}
              </Text>
            </View>
          );
        })}
        {!allDone ? (
          <TouchableOpacity onPress={addRep} style={[st.btn, { backgroundColor: color }]}>
            <Text style={st.btnTextDark}>+1 REP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ color, fontWeight: '800', fontSize: 12 }}>✓ DONE!</Text>
        )}
        <TouchableOpacity onPress={reset} style={st.resetBtn}>
          <Text style={st.resetBtnText}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── SHOT TRACKER ──────────────────────────────────────────────────────────────
export function ShotTracker({ color, targetReps, state, setState }) {
  const s = state || { makes: 0, attempts: 0 };
  const pct = s.attempts > 0 ? Math.round((s.makes / s.attempts) * 100) : 0;
  const progress = targetReps > 0 ? Math.round((s.makes / targetReps) * 100) : 0;

  const addMake = () => setState({ makes: s.makes + 1, attempts: s.attempts + 1 });
  const addMiss = () => setState({ makes: s.makes, attempts: s.attempts + 1 });
  const reset = () => setState({ makes: 0, attempts: 0 });

  return (
    <View style={st.trackerWrap}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <ProgressBar pct={progress} color={color} />
        <Text style={{ fontSize: 10, color: '#666', fontWeight: '600' }}>{s.makes}/{targetReps} makes</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <View style={badge('#00ff8814', '#00ff8830', '')}>
          <Text style={badgeText('#00ff88')}>🟢 {s.makes}</Text>
        </View>
        <View style={badge('#ff444414', '#ff444430', '')}>
          <Text style={badgeText('#ff6666')}>🔴 {s.attempts - s.makes}</Text>
        </View>
        <View style={badge(color + '18', color + '33', '')}>
          <Text style={badgeText(color)}>{pct}% FG</Text>
        </View>
        <TouchableOpacity onPress={addMake} style={[st.btn, { backgroundColor: '#00cc66' }]}>
          <Text style={st.btnTextDark}>✓ MAKE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={addMiss} style={[st.btn, { backgroundColor: '#cc3333' }]}>
          <Text style={[st.btnTextDark, { color: '#fff' }]}>✗ MISS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} style={st.resetBtn}>
          <Text style={st.resetBtnText}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── TIME TRACKER ──────────────────────────────────────────────────────────────
export function TimeTracker({ color, sets, targetReps, state, setState }) {
  const s = state || { completedSets: 0 };
  const allDone = s.completedSets >= sets;
  const completeSet = () => { if (!allDone) setState({ completedSets: s.completedSets + 1 }); };
  const reset = () => setState({ completedSets: 0 });

  return (
    <View style={st.trackerWrap}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {Array.from({ length: sets }).map((_, i) => {
          const isDone = i < s.completedSets;
          return (
            <View key={i} style={badge(isDone ? color + '28' : 'transparent', isDone ? color : '#ffffff15', '')}>
              <Text style={badgeText(isDone ? color : '#444')}>
                {isDone ? `S${i + 1}✓` : `S${i + 1} ${targetReps}s`}
              </Text>
            </View>
          );
        })}
        {!allDone ? (
          <TouchableOpacity onPress={completeSet} style={[st.btn, { backgroundColor: color }]}>
            <Text style={st.btnTextDark}>✓ SET DONE</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ color, fontWeight: '800', fontSize: 12 }}>✓ DONE!</Text>
        )}
        <TouchableOpacity onPress={reset} style={st.resetBtn}>
          <Text style={st.resetBtnText}>↺</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── CHECK TRACKER ─────────────────────────────────────────────────────────────
export function CheckTracker({ color, state, setState }) {
  const s = state || { done: false };
  return (
    <View style={st.trackerWrap}>
      <TouchableOpacity
        onPress={() => setState({ done: !s.done })}
        style={badge(s.done ? color + '22' : '#ffffff08', s.done ? color : '#ffffff15', '')}
      >
        <Text style={badgeText(s.done ? color : '#555', 11)}>
          {s.done ? '✓  COMPLETED' : 'MARK DONE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  trackerWrap: { marginTop: 10 },
  btn: {
    paddingVertical: 4, paddingHorizontal: 12,
    borderRadius: 4,
  },
  btnTextDark: { color: '#000', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  resetBtn: {
    paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 4, borderWidth: 1, borderColor: '#ffffff15',
  },
  resetBtnText: { color: '#444', fontSize: 13 },
});
