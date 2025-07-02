import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchDreamsByMonth } from '../api/dreams';
import '../styles/calendar.css';


export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emotionFilter, setEmotionFilter] = useState('');
  const [allEmotions, setAllEmotions] = useState([]);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const monthDreams = await fetchDreamsByMonth(currentYear, currentMonth + 1);

        const emotionSet = new Set();
        monthDreams.forEach(d => (d.emotions || []).forEach(e => emotionSet.add(e)));
        setAllEmotions(Array.from(emotionSet).sort());

        const filtered = emotionFilter
          ? monthDreams.filter(d => d.emotions.includes(emotionFilter))
          : monthDreams;

        setDreams(filtered);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching dreams');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentYear, currentMonth, emotionFilter]);

  if (loading) return <p className="calendar-loading">Loading dreams…</p>;
  if (error) return <p className="calendar-error">Error: {error}</p>;

  const dreamMap = Object.fromEntries(
    dreams.map(d => [parseInt(d.dream_date.split('-')[2], 10), d.id])
  );
  const dreamDates = new Set(Object.keys(dreamMap).map(Number));

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const navigateMonth = dir => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + dir);
    setCurrentDate(newDate);
  };

  const isToday = day =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const classes = ['calendar-day'];
    if (isToday(day)) classes.push('today');
    if (dreamDates.has(day)) classes.push('has-dream');

    if (dreamDates.has(day)) {
      const dreamId = dreamMap[day];
      calendarDays.push(
        <Link
          key={day}
          to={`/dreams/${dreamId}`}
          className={classes.join(' ')}
          aria-label={`${monthNames[currentMonth]} ${day}, ${currentYear} – has dream`}
        >
          <span className="day-number">{day}</span>
          <span className="dot-indicator" aria-hidden="true">●</span>
        </Link>
      );
    } else {
      calendarDays.push(
        <div key={day} className={classes.join(' ')}>
          <span className="day-number">{day}</span>
        </div>
      );
    }
  }

  return (
    <div className="calendar-page">
      <div className="calendar-controls">
        <button className="nav-button" onClick={() => navigateMonth(-1)} aria-label="Previous month">←</button>
        <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>
        <button className="nav-button" onClick={() => navigateMonth(1)} aria-label="Next month">→</button>
      </div>

      <div className="calendar-filter">
        <label htmlFor="emotion-select">Filter by Emotion:</label>
        <select
          id="emotion-select"
          value={emotionFilter}
          onChange={e => setEmotionFilter(e.target.value)}
        >
          <option value="">All Emotions</option>
          {allEmotions.map(emotion => (
            <option key={emotion} value={emotion}>{emotion}</option>
          ))}
        </select>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {daysOfWeek.map(d => (
            <div key={d} className="weekday-header">{d}</div>
          ))}
        </div>
        <div className="calendar-days">{calendarDays}</div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color today-indicator" /> <span>Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-color dream-indicator">●</span> <span>Dream recorded</span>
        </div>
      </div>
    </div>
  );
}
