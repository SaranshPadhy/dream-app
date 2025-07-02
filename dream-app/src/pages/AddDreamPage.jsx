import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dream.css';

export default function AddDreamPage() {
  const apiURL = 'http://127.0.0.1:8000/';
  const nav = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dream_date: '',
    lucidity: false,
    sleep_duration: '',
    recurring: false,
    room_temp: '',
    stress_before_sleep: '',
    emotions: []
  });

  const handleChange = e => {
    const { name, type, value, checked } = e.target;
    if (name === 'emotions') {
      setFormData(fd => ({ ...fd, emotions: value.split(',').map(s => s.trim()) }));
    } else if (type === 'checkbox') {
      setFormData(fd => ({ ...fd, [name]: checked }));
    } else {
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSuccess(false);

    const payload = {
      ...formData,
      sleep_duration: formData.sleep_duration === '' ? null : Number(formData.sleep_duration),
      room_temp: formData.room_temp === '' ? null : Number(formData.room_temp),
      stress_before_sleep: formData.stress_before_sleep === '' ? null : Number(formData.stress_before_sleep),
      dream_date: formData.dream_date === '' ? null : formData.dream_date,
    };

    fetch(`${apiURL}dreams`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    }).then((response) => {
      if (!response.ok) throw new Error('Failed to add dream');
      return response.json();
    }).then(data => {
      setSuccess(true);
      nav(`/dreams/${data.id}`);
    }).catch((error) => {
      console.error(error);
    });
  };

  const handleCancel = () => {
    if (window.confirm("Discard this new dream?")) {
      nav('/');
    }
  };

  return (
    <div className="dream-page">
      <h2 className="form-title">Add a New Dream</h2>
      {success && <p className="success-message">Dream added successfully!</p>}

      <form className="dream-form" onSubmit={handleSubmit}>
        <label>Title:
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
        </label>

        <label>Description:
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </label>

        <label>Date:
          <input type="date" name="dream_date" value={formData.dream_date} onChange={handleChange} />
        </label>

        <label className="checkbox-label">
          <input type="checkbox" name="lucidity" checked={formData.lucidity} onChange={handleChange} />
          Lucid Dream
        </label>

        <label>Sleep Duration (hours):
          <input type="number" name="sleep_duration" value={formData.sleep_duration} onChange={handleChange} />
        </label>

        <label className="checkbox-label">
          <input type="checkbox" name="recurring" checked={formData.recurring} onChange={handleChange} />
          Recurring Dream
        </label>

        <label>Room Temperature (°C):
          <input type="number" name="room_temp" value={formData.room_temp} onChange={handleChange} />
        </label>

        <label>Stress Before Sleep (1–10):
          <input type="number" name="stress_before_sleep" value={formData.stress_before_sleep} onChange={handleChange} />
        </label>

        <label>Emotions (comma-separated):
          <input type="text" name="emotions" value={formData.emotions.join(', ')} onChange={handleChange} />
        </label>

        <div className="button-row">
          <button type="submit" className="submit-button">Save</button>
          <button type="button" className="delete-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
