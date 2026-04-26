// screens/WorkoutScreen.js

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCHEDULE } from '../data/schedule';
import { RepTracker, ShotTracker, TimeTracker, CheckTracker } from '../components/Trackers';
import { saveSessionToSheets, getToken } from '../services/googleDrive';

export default function WorkoutScreen({ onGoToLogin }) {
  const [activeDay, setActiveDay] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [trackerState, setTrackerState] = useState({});
  const [activeTab, setActiveTab] = useState('workout');
  const [saving, setSaving] = useState(false);

  const day = SCHEDULE[activeDay];

  const setExState = (tKey, val) =>
    setTrackerState(prev => ({ ...prev, [tKey]: val }));

  const toggleBlock = (key) =>
    setExpanded(prev => ({ ...prev, [key]: !(prev[key] === false ? false : prev[key] !== true) }));

  const isExDone = (ex, s) => {
    if (!s) return false;
    if (ex.trackerType === 'check') return !!s.done;
    if (ex.trackerType === 'reps') return s.completedSets >= ex.sets;
    if (ex.trackerType === 'time') return s.completedSets >= ex.sets;
    if (ex.trackerType === 'shot') return (s.makes || 0) >= (ex.targetReps || 1);
    return false;
  };

  const getDayProgress = () => {
    let done = 0, total = 0;
    day.workouts.forEach((block, bi) => {
      (block.exercises || []).forEach((ex, ei) => {
        total++;
        const tKey = `${activeDay}-${bi}-${ei}`;
        if (isExDone(ex, trackerState[tKey])) done++;
      });
    });
    return { done, total };
  };

  const { done: dayDone, total: dayTotal } = getDayProgress();
  const dayPct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

  const shotStats = [];
  day.workouts.forEach((block, bi) => {
    (block.exercises || []).forEach((ex, ei) => {
      if (ex.trackerType === 'shot') {
        const tKey = `${activeDay}-${bi}-${ei}`;
        const s = trackerState[tKey] || { makes: 0, attempts: 0 };
        if (s.attempts > 0) shotStats.push({ name: ex.name, ...s });
      }
    });
  });

  const totalMakes = shotStats.reduce((a, s) => a + (s.makes || 0), 0);
  const totalAttempts = shotStats.reduce((a, s) => a + (s.attempts || 0), 0);
  const overallFG = totalAttempts > 0 ? Math.round((totalMakes / totalAttempts) * 100) : 0;
  const hasShotDay = day.workouts.some(b => (b.exercises || []).some(e => e.trackerType === 'shot'));

  const handleSave = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        'Not connected',
        'Connect your Google account first to save sessions.',
        [{ text: 'Connect Google', onPress: onGoToLogin }, { text: 'Cancel' }]
      );
      return;
    }
    setSaving(true);
    try {
      const result = await saveSessionToSheets({
        dayName: day.day,
        trackerState,
        schedule: SCHEDULE,
      });
      Alert.alert('Saved! 🏀', `${result.saved} exercise logs saved to your Google Sheet.`);
    } catch (e) {
      Alert.alert('Error saving', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={st.safeArea}>
      {/* HEADER */}
      <View style={[st.header, { borderBottomColor: day.color }]}>
        <View style={{ flex: 1 }}>
          <View style={st.headerTop}>
            <View style={[st.dot, { backgroundColor: day.color, shadowColor: day.color }]} />
            <Text style={st.headerSub}>PRO DEVELOPMENT</Text>
          </View>
          <Text style={st.headerDay}>
            <Text style={{ color: day.color }}>{day.day}</Text>
            {'\n'}
            <Text style={st.headerLabel}>{day.label}</Text>
          </Text>
          <View style={st.tagRow}>
            <View style={[st.tag, { backgroundColor: day.color + '22', borderColor: day.color + '44' }]}>
              <Text style={[st.tagText, { color: day.color }]}>{day.tag}</Text>
            </View>
            <View style={[st.tag, { backgroundColor: '#ffffff08', borderColor: '#ffffff12' }]}>
              <Text style={[st.tagText, { color: '#555' }]}>NEIGHBOR SAFE 🔇</Text>
            </View>
          </View>
        </View>
        {/* Progress ring */}
        <View style={st.ringWrap}>
          <View style={[st.ringOuter, {
            backgroundColor: '#1e1e2a',
            borderColor: day.color,
            borderWidth: 3,
          }]}>
            <Text style={[st.ringPct, { color: day.color }]}>{dayPct}%</Text>
          </View>
          <Text style={st.ringLabel}>{dayDone}/{dayTotal}</Text>
        </View>
      </View>

      {/* DAY SELECTOR */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.dayBar} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {SCHEDULE.map((d, i) => (
          <TouchableOpacity key={i} onPress={() => { setActiveDay(i); setExpanded({}); setActiveTab('workout'); }} style={st.dayBtn}>
            <Text style={[st.dayBtnText, { color: i === activeDay ? d.color : '#3a3a3a' }]}>
              {d.day.slice(0, 3)}
            </Text>
            {i === activeDay && <View style={[st.dayUnderline, { backgroundColor: d.color }]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* VIEW TABS */}
      <View style={st.tabRow}>
        {['workout', ...(hasShotDay ? ['shot stats'] : [])].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[st.tabBtn, {
              backgroundColor: activeTab === tab ? day.color + '1a' : 'transparent',
              borderColor: activeTab === tab ? day.color : '#ffffff12',
            }]}>
            <Text style={[st.tabBtnText, { color: activeTab === tab ? day.color : '#444' }]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={handleSave} style={[st.saveBtn, { borderColor: day.color + '66' }]} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color={day.color} />
            : <Text style={[st.saveBtnText, { color: day.color }]}>💾 SAVE</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>

        {/* ── SHOT STATS ── */}
        {activeTab === 'shot stats' && (
          <View>
            <View style={[st.card, { borderColor: day.color + '2a', borderLeftColor: day.color }]}>
              <Text style={[st.cardTitle, { color: day.color }]}>TODAY'S SHOOTING SUMMARY</Text>
              <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
                {[{ label: 'MAKES', val: totalMakes, col: '#00ff88' }, { label: 'ATTEMPTS', val: totalAttempts, col: '#888' }, { label: 'FG%', val: `${overallFG}%`, col: day.color }].map(({ label, val, col }) => (
                  <View key={label}>
                    <Text style={{ color: col, fontWeight: '900', fontSize: 32, lineHeight: 34 }}>{val}</Text>
                    <Text style={{ color: '#444', fontSize: 9, letterSpacing: 2 }}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
            {shotStats.length === 0 && (
              <Text style={{ color: '#444', textAlign: 'center', marginTop: 40, fontSize: 13 }}>
                No shots logged yet. Head to Workout to start tracking!
              </Text>
            )}
            {shotStats.map((s, i) => {
              const fg = s.attempts > 0 ? Math.round((s.makes / s.attempts) * 100) : 0;
              const barColor = fg >= 50 ? '#00ff88' : fg >= 35 ? day.color : '#ff5555';
              return (
                <View key={i} style={[st.card, { marginBottom: 8 }]}>
                  <Text style={{ color: '#ccc', fontWeight: '700', fontSize: 13, marginBottom: 7 }}>{s.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 3, backgroundColor: '#ffffff10', borderRadius: 2, overflow: 'hidden' }}>
                      <View style={{ width: `${fg}%`, height: '100%', backgroundColor: barColor, borderRadius: 2 }} />
                    </View>
                    <Text style={{ color: barColor, fontWeight: '700', fontSize: 12 }}>{s.makes}/{s.attempts} ({fg}%)</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── WORKOUT ── */}
        {activeTab === 'workout' && day.workouts.map((block, bi) => {
          const key = `${activeDay}-${bi}`;
          const isOpen = expanded[key] !== false;
          const exs = block.exercises || [];
          const blockDone = exs.filter((ex, ei) => isExDone(ex, trackerState[`${activeDay}-${bi}-${ei}`])).length;

          return (
            <View key={bi} style={{ marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => setExpanded(prev => ({ ...prev, [key]: !isOpen }))}
                style={[st.blockHeader, { borderLeftColor: day.color }]}
              >
                <Text style={st.blockHeaderText}>{block.category}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 11, color: blockDone === exs.length ? day.color : '#444', fontWeight: '700' }}>
                    {blockDone}/{exs.length}
                  </Text>
                  <Text style={{ color: day.color, fontSize: 18, fontWeight: '300' }}>{isOpen ? '−' : '+'}</Text>
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={st.blockBody}>
                  {exs.map((ex, ei) => {
                    const tKey = `${activeDay}-${bi}-${ei}`;
                    const exState = trackerState[tKey];
                    const done = isExDone(ex, exState);
                    return (
                      <View key={ei} style={[st.exRow, {
                        backgroundColor: done ? day.color + '09' : ei % 2 === 0 ? '#ffffff02' : 'transparent',
                        borderBottomColor: '#ffffff07',
                        borderBottomWidth: ei < exs.length - 1 ? 1 : 0,
                      }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={[st.exName, { color: done ? day.color : '#E0DBD5' }]}>
                              {done ? '✓ ' : ''}{ex.name}
                            </Text>
                            <Text style={st.exNote}>{ex.note}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            {ex.sets > 1 && (
                              <View style={[{ marginBottom: 3 }, { paddingVertical: 1, paddingHorizontal: 6, borderRadius: 3, backgroundColor: day.color + '1a', borderWidth: 1, borderColor: day.color + '33' }]}>
                                <Text style={{ color: day.color, fontWeight: '700', fontSize: 10 }}>{ex.sets}×</Text>
                              </View>
                            )}
                            <View style={{ paddingVertical: 1, paddingHorizontal: 6, borderRadius: 3, backgroundColor: '#ffffff0a', borderWidth: 1, borderColor: '#ffffff12' }}>
                              <Text style={{ color: '#aaa', fontWeight: '600', fontSize: 10 }}>{ex.reps}</Text>
                            </View>
                          </View>
                        </View>

                        {ex.trackerType === 'reps' && (
                          <RepTracker color={day.color} sets={ex.sets} targetReps={ex.targetReps}
                            state={exState} setState={v => setExState(tKey, v)} />
                        )}
                        {ex.trackerType === 'shot' && (
                          <ShotTracker color={day.color} targetReps={ex.targetReps}
                            state={exState} setState={v => setExState(tKey, v)} />
                        )}
                        {ex.trackerType === 'time' && (
                          <TimeTracker color={day.color} sets={ex.sets} targetReps={ex.targetReps}
                            state={exState} setState={v => setExState(tKey, v)} />
                        )}
                        {ex.trackerType === 'check' && (
                          <CheckTracker color={day.color} state={exState} setState={v => setExState(tKey, v)} />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* NOTES */}
        {activeTab === 'workout' && (
          <View style={[st.card, { borderLeftColor: day.color, marginTop: 8 }]}>
            <Text style={[st.cardTitle, { color: day.color, marginBottom: 10 }]}>📋 PROGRAM NOTES</Text>
            {[
              ['Target weight', 'Aim for 90–95kg lean over 18 months. Mobility > mass for forwards.'],
              ['Noise rule', 'Soft landings on all jumps. Yoga mat or carpet. No bare floor impact.'],
              ['Protein', '180–200g/day. Eat within 30 min of training.'],
              ['Sleep', '8–9 hours minimum. Skill consolidation peaks during deep sleep.'],
              ['Saturday', 'Court time is mandatory. Film yourself. Track shot %. Data drives progress.'],
            ].map(([k, v]) => (
              <Text key={k} style={st.noteText}>• <Text style={{ color: '#bbb', fontWeight: '600' }}>{k}:</Text> {v}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { borderBottomWidth: 3, padding: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#0e0e1a' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, shadowOpacity: 0.8, shadowRadius: 4 },
  headerSub: { fontSize: 9, letterSpacing: 4, color: '#555', fontWeight: '600' },
  headerDay: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 30 },
  headerLabel: { fontSize: 14, fontWeight: '700', color: '#aaa', letterSpacing: 1 },
  tagRow: { flexDirection: 'row', gap: 5, marginTop: 8, flexWrap: 'wrap' },
  tag: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 2, borderWidth: 1 },
  tagText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  ringWrap: { alignItems: 'center', marginLeft: 10 },
  ringOuter: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontWeight: '800', fontSize: 11 },
  ringLabel: { fontSize: 9, color: '#444', marginTop: 2, letterSpacing: 1 },
  dayBar: { borderBottomWidth: 1, borderBottomColor: '#ffffff0d' },
  dayBtn: { paddingVertical: 8, paddingHorizontal: 12, position: 'relative' },
  dayBtnText: { fontWeight: '700', fontSize: 11, letterSpacing: 2 },
  dayUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  tabRow: { flexDirection: 'row', padding: 10, gap: 6, alignItems: 'center' },
  tabBtn: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 3, borderWidth: 1 },
  tabBtnText: { fontWeight: '700', fontSize: 10, letterSpacing: 2 },
  saveBtn: { marginLeft: 'auto', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 3, borderWidth: 1 },
  saveBtnText: { fontWeight: '700', fontSize: 10, letterSpacing: 1 },
  card: { padding: 16, backgroundColor: '#ffffff04', borderWidth: 1, borderColor: '#ffffff08', borderLeftWidth: 3, borderRadius: 4, marginBottom: 10 },
  cardTitle: { fontWeight: '800', fontSize: 11, letterSpacing: 3 },
  blockHeader: { backgroundColor: '#ffffff05', borderWidth: 1, borderColor: '#ffffff10', borderLeftWidth: 3, borderRadius: 4, padding: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blockHeaderText: { color: '#E8E4DF', fontWeight: '700', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  blockBody: { borderWidth: 1, borderColor: '#ffffff08', borderTopWidth: 0, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, overflow: 'hidden' },
  exRow: { padding: 12 },
  exName: { fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
  exNote: { color: '#666', fontSize: 11, marginTop: 3, lineHeight: 16 },
  noteText: { color: '#888', fontSize: 12, lineHeight: 20, marginBottom: 4 },
});
