import { useState } from "react";
import { SCHEDULE } from "./data/schedule.js";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TrainingCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Convert Sunday=0 to Mon=0 format
  const startOffset = (firstDay.getDay() + 6) % 7;

  const getScheduleForDate = (date) => {
    const d = new Date(currentYear, currentMonth, date);
    const dayOfWeek = (d.getDay() + 6) % 7; // Mon=0, Sun=6
    return SCHEDULE[dayOfWeek];
  };

  const isToday = (date) =>
    date === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const selected = selectedDay ? getScheduleForDate(selectedDay) : null;

  const s = {
    wrap: { padding: "20px 16px", fontFamily: "Barlow Condensed, sans-serif", color: "#fff", minHeight: "100vh", background: "#0a0f1e" },
    title: { fontSize: 22, fontWeight: 800, letterSpacing: 3, color: "#FF6B35", marginBottom: 20 },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    monthLabel: { fontSize: 18, fontWeight: 700, letterSpacing: 2 },
    navBtn: { background: "none", border: "1px solid #333", color: "#fff", width: 32, height: 32, borderRadius: 6, cursor: "pointer", fontSize: 16 },
    dayHeaders: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 },
    dayHeader: { textAlign: "center", fontSize: 10, letterSpacing: 1, color: "#555", padding: "4px 0" },
    grid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 },
    dayCell: (date, sched, isTod, isSel) => ({
      aspectRatio: "1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 6,
      cursor: date ? "pointer" : "default",
      background: isSel ? "#FF6B35" : isTod ? "#1e293b" : "transparent",
      border: isTod && !isSel ? "1px solid #FF6B3555" : "1px solid transparent",
      position: "relative",
    }),
    dateNum: (isSel) => ({ fontSize: 13, fontWeight: 700, color: isSel ? "#000" : "#fff" }),
    dot: (color) => ({ width: 4, height: 4, borderRadius: "50%", background: color, marginTop: 2 }),
    detailCard: { background: "#111827", borderRadius: 12, padding: "20px 16px", marginTop: 16 },
    detailDay: { fontSize: 11, letterSpacing: 3, color: "#666", marginBottom: 4 },
    detailLabel: (color) => ({ fontSize: 20, fontWeight: 800, color: color || "#FF6B35", letterSpacing: 2, marginBottom: 12 }),
    tag: (color) => ({ display: "inline-block", fontSize: 10, letterSpacing: 2, color: color, border: `1px solid ${color}`, padding: "2px 8px", borderRadius: 3, marginBottom: 16 }),
    catTitle: { fontSize: 11, letterSpacing: 2, color: "#555", marginBottom: 6, marginTop: 12 },
    exRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e293b" },
    exName: { fontSize: 14, fontWeight: 600 },
    exMeta: { fontSize: 11, color: "#888", letterSpacing: 1 },
  };

  return (
    <div style={s.wrap}>
      <div style={s.title}>TRAINING CALENDAR</div>

      <div style={s.header}>
        <button style={s.navBtn} onClick={prevMonth}>‹</button>
        <span style={s.monthLabel}>{MONTHS[currentMonth]} {currentYear}</span>
        <button style={s.navBtn} onClick={nextMonth}>›</button>
      </div>

      <div style={s.dayHeaders}>
        {DAYS.map(d => <div key={d} style={s.dayHeader}>{d}</div>)}
      </div>

      <div style={s.grid}>
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = i + 1;
          const sched = getScheduleForDate(date);
          const isTod = isToday(date);
          const isSel = selectedDay === date;
          return (
            <div key={date} style={s.dayCell(date, sched, isTod, isSel)} onClick={() => setSelectedDay(isSel ? null : date)}>
              <span style={s.dateNum(isSel)}>{date}</span>
              {sched && !isSel && <div style={s.dot(sched.color || "#FF6B35")} />}
            </div>
          );
        })}
      </div>

      {selectedDay && selected && (
        <div style={s.detailCard}>
          <div style={s.detailDay}>{DAYS[(new Date(currentYear, currentMonth, selectedDay).getDay() + 6) % 7]} · {MONTHS[currentMonth]} {selectedDay}</div>
          <div style={s.detailLabel(selected.color)}>{selected.label}</div>
          <span style={s.tag(selected.color)}>{selected.tag}</span>
          {selected.workouts?.map((cat, ci) => (
            <div key={ci}>
              <div style={s.catTitle}>{cat.category?.toUpperCase()}</div>
              {cat.exercises?.map((ex, ei) => (
                <div key={ei} style={s.exRow}>
                  <span style={s.exName}>{ex.name}</span>
                  <span style={s.exMeta}>{ex.sets}×{ex.reps}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {selectedDay && !selected && (
        <div style={s.detailCard}>
          <div style={{ textAlign: "center", color: "#555", fontSize: 13, letterSpacing: 2 }}>REST DAY</div>
        </div>
      )}
    </div>
  );
}
