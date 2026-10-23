import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import API from '../api';

export default function EditEventModal({ isOpen, onClose, event, onEventUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passcode, setPasscode] = useState('');
  const [criteria, setCriteria] = useState([]);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setPasscode(event.passcode || '');
      setCriteria(event.criteria || []);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleAddCriteria = () => {
    const key = `criteria_${Date.now()}`;
    setCriteria([...criteria, { key, label: '' }]);
  };

  const handleRemoveCriteria = (index) => {
    if (criteria.length <= 5) {
      alert('Cannot delete: An event must retain at least 5 evaluation questions.');
      return;
    }
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriteriaChange = (index, value) => {
    const updated = [...criteria];
    updated[index].label = value;
    setCriteria(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (criteria.length < 5) {
      alert('Events must have at least 5 evaluation questions.');
      return;
    }

    try {
      const res = await API.put(`/events/${event._id}`, {
        title,
        description,
        passcode,
        criteria,
      });
      onEventUpdated(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update event');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-lg p-6 rounded-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-700 mb-4">
          <h2 className="text-lg font-bold">Manage Event & Questions</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
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
              <label className="block text-slate-300 font-semibold mb-1">Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Questions</label>
              <input
                type="text"
                disabled
                value={`${criteria.length} (Min. 5 required)`}
                className="w-full p-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
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

          <div className="pt-2 border-t border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-indigo-400 uppercase tracking-wider">
                Evaluation Questions ({criteria.length})
              </label>
              <button
                type="button"
                onClick={handleAddCriteria}
                className="flex items-center gap-1 text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
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
                  disabled={criteria.length <= 5}
                  className={`p-2 transition ${
                    criteria.length <= 5
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-red-400 cursor-pointer'
                  }`}
                  title={criteria.length <= 5 ? 'Minimum 5 questions required' : 'Delete Question'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition text-white mt-4 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Criteria Changes
          </button>
        </form>
      </div>
    </div>
  );
}