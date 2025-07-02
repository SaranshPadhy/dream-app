import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDreamById } from '../api/dreams';
import '../styles/dream.css';

export default function DreamPage() {
  const { id } = useParams();
  const apiURL = 'http://127.0.0.1:8000/';
  const nav = useNavigate();

  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchDreamById(id)
      .then(data => {
        setDream(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          dream_date: data.dream_date || '',
          lucidity: data.lucidity || false,
          sleep_duration: data.sleep_duration ?? '',
          recurring: data.recurring || false,
          room_temp: data.room_temp ?? '',
          stress_before_sleep: data.stress_before_sleep ?? '',
          emotions: data.emotions || []
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error fetching dream');
        setLoading(false);
      });
  }, [id]);

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
    fetch(`${apiURL}dreams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" }
    }).then((response) => {
      if (!response.ok) throw new Error('Failed to update dream');
      setSuccess(true);
    }).catch((error) => {
      console.error(error);
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this dream?")) return;
    fetch(`${apiURL}dreams/${id}`, {
      method: 'DELETE'
    }).then(() => nav('/'))
      .catch((error) => console.error(error));
  };

  if (loading) return <p className="dream-loading">Loading dream…</p>;
  if (error) return <p className="dream-error">Error: {error}</p>;
  if (!dream) return <p>No dream found.</p>;

  return (
    <div className="dream-page">
      <h2 className="form-title">Edit Dream</h2>
      {success && <p className="success-message">Dream saved successfully!</p>}

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
          <button type="button" className="delete-button" onClick={handleDelete}>Delete</button>
        </div>
      </form>
    </div>
  );
}
