import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import API from '../api';

export default function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Technical Workshop');
  const [description, setDescription] = useState('');
  const [passcode, setPasscode] = useState('1234');
  const [criteria, setCriteria] = useState([
    { key: 'speaker_clarity', label: 'Speaker & Explanation Clarity' },
    { key: 'coding_utility', label: 'Hands-on Coding & Utility' },
    { key: 'workshop_pace', label: 'Workshop Pacing & Speed' },
    { key: 'qa_interaction', label: 'Q&A & Support Responsiveness' },
    { key: 'venue_equipment', label: 'Venue, Audio & Logistics' },
  ]);

  if (!isOpen) return null;

  const handleAddCriteria = () => {
    const key = `criteria_${Date.now()}`;
    setCriteria([...criteria, { key, label: '' }]);
  };

  const handleRemoveCriteria = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (index, value) => {
    const updated = [...criteria];
    updated[index].label = value;
    setCriteria(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/events', {
        title,
        eventType,
        description,
        passcode,
        criteria,
      });
      onEventCreated(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-700 mb-4">
          <h2 className="text-lg font-bold">Create New Event</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              >
                <option>Technical Workshop</option>
                <option>Hackathon</option>
                <option>Seminar / Talk</option>
                <option>Gaming / Cultural</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>

          {/* Criteria Management */}
          <div className="pt-2 border-t border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-indigo-400 uppercase tracking-wider">
                Detailed Evaluation Questions (Min. 5 Recommended)
              </label>
              <button
                type="button"
                onClick={handleAddCriteria}
                className="flex items-center gap-1 text-emerald-400 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Field
              </button>
            </div>

            {criteria.map((c, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  placeholder={`Question ${idx + 1}`}
                  value={c.label}
                  onChange={(e) => handleCriteriaChange(idx, e.target.value)}
                  className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCriteria(idx)}
                  className="p-2 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition text-white mt-4"
          >
            Create & Save Event
          </button>
        </form>
      </div>
    </div>
  );
}