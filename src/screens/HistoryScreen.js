// screens/HistoryScreen.js

import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchHistory, getToken } from '../services/googleDrive';

export default function HistoryScreen({ onGoToLogin }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const token = await getToken();
    if (!token) { setIsLoggedIn(false); setLoading(false); return; }
    setIsLoggedIn(true);
    try {
      const data = await fetchHistory();
      setRows(data);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Group by date
  const byDate = {};
  rows.forEach(r => {
    if (!r.Date) return;
    if (!byDate[r.Date]) byDate[r.Date] = [];
    byDate[r.Date].push(r);
  });
  const dates = Object.keys(byDate).reverse();

  // Shot summary per date
  const shotSummary = (dateRows) => {
    const shots = dateRows.filter(r => r.Type === 'shot' && r.Attempts > 0);
    const makes = shots.reduce((a, r) => a + Number(r.Makes || 0), 0);
    const attempts = shots.reduce((a, r) => a + Number(r.Attempts || 0), 0);
    if (!attempts) return null;
    return { makes, attempts, fg: Math.round((makes / attempts) * 100) };
  };

  if (loading) {
    return (
      <SafeAreaView style={st.safe}>
        <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={st.safe}>
        <View style={st.center}>
          <Text style={st.emoji}>📊</Text>
          <Text style={st.bigTitle}>Connect Google Drive</Text>
          <Text style={st.sub}>Link your Google account to save and view your workout history across sessions.</Text>
          <TouchableOpacity onPress={onGoToLogin} style={st.connectBtn}>
            <Text style={st.connectBtnText}>Connect Google Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.safe}>
      <View style={st.header}>
        <Text style={st.title}>Session History</Text>
        <Text style={st.sub2}>{rows.length} entries logged</Text>
      </View>

      {error ? (
        <Text style={{ color: '#ff5555', padding: 16, fontSize: 13 }}>⚠ {error}</Text>
      ) : null}

      {rows.length === 0 && !error ? (
        <View style={st.center}>
          <Text style={st.emoji}>🏀</Text>
          <Text style={st.bigTitle}>No sessions yet</Text>
          <Text style={st.sub}>Complete a workout and tap 💾 SAVE to log your first session.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 14, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#FF6B35" />}
        >
          {dates.map(date => {
            const dateRows = byDate[date];
            const shot = shotSummary(dateRows);
            const dayName = dateRows[0]?.Day || '';
            const dayColors = {
              Monday: '#FF6B35', Tuesday: '#00B4D8', Wednesday: '#4CAF50',
              Thursday: '#9B59B6', Friday: '#F7DC6F', Saturday: '#E74C3C', Sunday: '#7F8C8D',
            };
            const color = dayColors[dayName] || '#FF6B35';
            const categories = [...new Set(dateRows.map(r => r.Category))];

            return (
              <View key={date} style={[st.card, { borderLeftColor: color }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View>
                    <Text style={[st.dateText, { color }]}>{date}</Text>
                    <Text style={st.dayText}>{dayName}</Text>
                  </View>
                  {shot && (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#00ff88', fontWeight: '800', fontSize: 18, lineHeight: 20 }}>{shot.makes}</Text>
                      <Text style={{ color: '#555', fontSize: 9, letterSpacing: 1 }}>MAKES</Text>
                      <Text style={{ color, fontWeight: '700', fontSize: 12 }}>{shot.fg}% FG</Text>
                    </View>
                  )}
                </View>

                {/* Categories */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {categories.map(c => (
                    <View key={c} style={{ paddingVertical: 2, paddingHorizontal: 7, borderRadius: 3, backgroundColor: color + '18', borderWidth: 1, borderColor: color + '33' }}>
                      <Text style={{ color, fontSize: 9, fontWeight: '700', letterSpacing: 1 }}>{c}</Text>
                    </View>
                  ))}
                </View>

                {/* Exercise rows */}
                {dateRows.filter(r => r.Type !== 'check' || r['Sets Done'] === '✓').slice(0, 6).map((r, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#ffffff07' }}>
                    <Text style={{ color: '#999', fontSize: 11, flex: 1 }} numberOfLines={1}>{r.Exercise}</Text>
                    <Text style={{ color: '#555', fontSize: 11, marginLeft: 8 }}>
                      {r.Type === 'shot'
                        ? `${r.Makes}/${r.Attempts} (${r['FG%']})`
                        : r.Type === 'reps'
                          ? `${r['Sets Done']} sets · ${r['Reps Done']} reps`
                          : r.Type === 'time'
                            ? `${r['Sets Done']} sets`
                            : r['Sets Done'] === '✓' ? '✓' : ''}
                    </Text>
                  </View>
                ))}
                {dateRows.length > 6 && (
                  <Text style={{ color: '#444', fontSize: 11, marginTop: 6 }}>+{dateRows.length - 6} more exercises</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 18, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff0d' },
  title: { color: '#F0EDE8', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  sub2: { color: '#444', fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 48, marginBottom: 16 },
  bigTitle: { color: '#E0DBD5', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  sub: { color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  connectBtn: { marginTop: 24, backgroundColor: '#FF6B35', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 6 },
  connectBtnText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  card: { backgroundColor: '#ffffff04', borderWidth: 1, borderColor: '#ffffff08', borderLeftWidth: 3, borderRadius: 6, padding: 14, marginBottom: 12 },
  dateText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  dayText: { color: '#888', fontSize: 11, marginTop: 1, fontWeight: '600' },
});
