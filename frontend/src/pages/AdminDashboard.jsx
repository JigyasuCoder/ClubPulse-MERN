import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Bot, LogOut, Plus, Filter, Search, ArrowLeft, Calendar,
  MessageSquare, Key, Settings, Star, Eye, X, ChevronRight, Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import API from '../api';
import AiAssistantModal from '../components/AiAssistantModal';
import CreateEventModal from '../components/CreateEventModal';
import EditEventModal from '../components/EditEventModal';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState('All');

  // Modals
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [inspectFeedback, setInspectFeedback] = useState(null);

  const fetchEvents = () => {
    API.get('/events')
      .then((res) => setEvents(res.data))
      .catch((err) => console.error('Fetch events error:', err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedEvent) {
      API.get(`/feedback/${selectedEvent._id}`)
        .then((res) => setFeedback(res.data))
        .catch((err) => console.error('Fetch feedback error:', err));
      setIsAiOpen(true);
    } else {
      setIsAiOpen(false);
    }
  }, [selectedEvent]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleEventUpdated = (updatedEvent) => {
    setSelectedEvent(updatedEvent);
    setEvents((prev) => prev.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)));
  };

  const handleDeleteEvent = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await API.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((evt) => evt._id !== id));
      if (selectedEvent?._id === id) {
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. Please try again.');
    }
  };

  const getRatingDistribution = (key, isDetailed = false) => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach((item) => {
      const score = isDetailed ? item.detailedRatings?.[key] : item.coreRatings?.[key];
      if (score && counts[score] !== undefined) {
        counts[score] += 1;
      }
    });
    return [
      { stars: '1★', count: counts[1] },
      { stars: '2★', count: counts[2] },
      { stars: '3★', count: counts[3] },
      { stars: '4★', count: counts[4] },
      { stars: '5★', count: counts[5] },
    ];
  };

  const filteredFeedback = feedback.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesQuestion = true;
    if (selectedQuestionFilter !== 'All') {
      if (['overall', 'organization', 'content'].includes(selectedQuestionFilter)) {
        matchesQuestion = Boolean(item.coreRatings?.[selectedQuestionFilter]);
      } else {
        matchesQuestion = Boolean(item.detailedRatings?.[selectedQuestionFilter]);
      }
    }

    return matchesCategory && matchesSearch && matchesQuestion;
  });

  const starColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6 bg-[#0b0c1b] text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex justify-between items-center bg-[#12132b]/80 backdrop-blur-md p-4 rounded-2xl border border-purple-500/20 shadow-xl shadow-purple-950/30 relative z-10">
        <div className="flex items-center gap-3">
          {selectedEvent && (
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-2 bg-[#181a3a] hover:bg-slate-700 rounded-xl transition text-slate-300 cursor-pointer border border-purple-500/20"
              title="Back to Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-wide">ClubPulse Admin Portal</h1>
            <p className="text-xs text-slate-400">
              {selectedEvent ? `Viewing: ${selectedEvent.title}` : 'CODEIO Event Insights'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:opacity-90 rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/25 transition cursor-pointer text-white"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-[#181a3a] hover:bg-rose-600/80 rounded-xl transition text-slate-300 border border-purple-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: EVENT CARDS GRID */}
      {!selectedEvent ? (
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">All Events</h2>
            <span className="text-xs text-slate-400">{events.length} Total Events</span>
          </div>

          {events.length === 0 ? (
            <div className="bg-[#12132b]/80 p-12 text-center rounded-2xl border border-purple-500/20 text-slate-400">
              No events found. Click "+ Create Event" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((evt) => (
                <div
                  key={evt._id}
                  onClick={() => setSelectedEvent(evt)}
                  className="bg-[#12132b]/90 hover:bg-[#181a3a] border border-purple-500/20 hover:border-purple-400/50 p-5 rounded-2xl shadow-lg shadow-purple-950/20 transition hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-full uppercase border border-purple-500/30">
                        {evt.eventType || 'Event'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          {new Date(evt.createdAt).toLocaleDateString()}
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteEvent(e, evt._id)}
                          className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">{evt.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-3 border-t border-purple-500/15 flex justify-between items-center text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-purple-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>{evt.feedbackCount || 0} Feedbacks</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{evt.passcode || 'None'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: DETAILED EVENT DASHBOARD */
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#12132b]/90 p-5 rounded-2xl border border-purple-500/20 md:col-span-2 space-y-3 shadow-xl">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">{selectedEvent.eventType}</span>
                <button
                  onClick={() => setIsEditEventOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181a3a] hover:bg-slate-700 text-xs font-semibold rounded-lg text-purple-300 border border-purple-500/20 transition cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" /> Manage Questions
                </button>
              </div>
              <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
              <p className="text-xs text-slate-400">{selectedEvent.description}</p>
              <div className="pt-2 text-xs text-slate-300 space-y-1">
                <p><strong>Passcode:</strong> {selectedEvent.passcode || 'None'}</p>
                <p>
                  <strong>Direct Feedback Link:</strong>{' '}
                  <a
                    href={`${window.location.origin}/feedback/${selectedEvent._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-400 underline"
                  >
                    {`${window.location.origin}/feedback/${selectedEvent._id}`}
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-[#12132b]/90 p-5 rounded-2xl border border-purple-500/20 flex flex-col items-center justify-center text-center shadow-xl">
              <QRCodeSVG
                value={`${window.location.origin}/feedback/${selectedEvent._id}`}
                size={110}
                className="p-2 bg-white rounded-xl mb-2"
              />
              <span className="text-xs text-slate-400 font-medium">Scan QR Code</span>
            </div>
          </div>

          <div className="bg-[#12132b]/90 p-6 rounded-2xl border border-purple-500/20 space-y-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Rating Distribution Analytics
            </h2>

            <div>
              <h3 className="text-xs font-semibold text-rose-400 mb-3 uppercase tracking-wider">
                Tier 1: Core Quick Ratings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'overall', label: 'Overall Experience' },
                  { key: 'organization', label: 'Event Organization' },
                  { key: 'content', label: 'Content & Value' },
                ].map(({ key, label }) => {
                  const chartData = getRatingDistribution(key);
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedQuestionFilter(key)}
                      className={`bg-[#0b0c1b]/80 p-4 rounded-xl border transition cursor-pointer ${
                        selectedQuestionFilter === key ? 'border-purple-400 shadow-md ring-1 ring-purple-400' : 'border-purple-500/20 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-200">{label}</span>
                        {selectedQuestionFilter === key && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Filtered</span>}
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="stars" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#12132b', borderColor: '#3b0764', borderRadius: '8px', fontSize: '11px' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={starColors[index]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedEvent.criteria?.length > 0 && (
              <div className="pt-4 border-t border-purple-500/15">
                <h3 className="text-xs font-semibold text-rose-400 mb-3 uppercase tracking-wider">
                  Tier 2: Detailed Questions Ratings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedEvent.criteria.map((item) => {
                    const chartData = getRatingDistribution(item.key, true);
                    return (
                      <div
                        key={item.key}
                        onClick={() => setSelectedQuestionFilter(item.key)}
                        className={`bg-[#0b0c1b]/80 p-4 rounded-xl border transition cursor-pointer ${
                          selectedQuestionFilter === item.key ? 'border-purple-400 shadow-md ring-1 ring-purple-400' : 'border-purple-500/20 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-200 line-clamp-1">{item.label}</span>
                          {selectedQuestionFilter === item.key && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Filtered</span>}
                        </div>
                        <div className="h-28 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <XAxis dataKey="stars" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#12132b', borderColor: '#3b0764', borderRadius: '8px', fontSize: '11px' }} />
                              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={starColors[index]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#12132b]/90 p-6 rounded-2xl border border-purple-500/20 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-4 h-4 text-slate-400" />
                {['All', 'Positive', 'Constructive Criticism', 'Logistics', 'Negative', 'Spam / Flagged'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                          : 'bg-[#0b0c1b] text-slate-400 hover:bg-[#181a3a] border border-purple-500/20'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                {selectedQuestionFilter !== 'All' && (
                  <button
                    onClick={() => setSelectedQuestionFilter('All')}
                    className="px-3 py-2 bg-[#181a3a] hover:bg-slate-700 text-slate-300 text-xs rounded-xl flex items-center gap-1 border border-purple-500/20 cursor-pointer"
                  >
                    Clear Question Filter <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search comments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c1b] rounded-xl border border-purple-500/20 text-xs focus:outline-none focus:border-rose-400 text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFeedback.length === 0 ? (
                <p className="text-xs text-slate-500 col-span-2 py-8 text-center">
                  No feedback entries found matching your filters.
                </p>
              ) : (
                filteredFeedback.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setInspectFeedback(item)}
                    className="bg-[#0b0c1b] p-4 rounded-xl border border-purple-500/20 space-y-3 hover:border-purple-400/60 transition cursor-pointer group"
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.category === 'Positive'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.category === 'Constructive Criticism'
                            ? 'bg-amber-500/20 text-amber-400'
                            : item.category === 'Logistics'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : item.category === 'Spam / Flagged'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-3">
                      {item.comment || 'No text remarks provided.'}
                    </p>
                    <div className="pt-2 border-t border-purple-500/10 flex justify-between text-[11px] text-rose-400 font-semibold">
                      <span>Overall: {item.coreRatings?.overall || 'N/A'}★</span>
                      <span className="flex items-center gap-1 group-hover:underline">
                        View Full Feedback <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {inspectFeedback && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12132b] w-full max-w-xl p-6 rounded-2xl border border-purple-500/30 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
              <div>
                <h3 className="font-bold text-base text-white">Attendee Feedback Submission</h3>
                <p className="text-xs text-slate-400">
                  Submitted on {new Date(inspectFeedback.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setInspectFeedback(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Tier 1 Ratings</h4>
              <div className="grid grid-cols-3 gap-2 text-xs bg-[#0b0c1b] p-3 rounded-xl border border-purple-500/20">
                <div>
                  <span className="text-slate-400 block text-[10px]">Overall</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    {inspectFeedback.coreRatings?.overall || '-'} <Star className="w-3 h-3 fill-amber-400" />
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Organization</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    {inspectFeedback.coreRatings?.organization || '-'} <Star className="w-3 h-3 fill-amber-400" />
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Content</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    {inspectFeedback.coreRatings?.content || '-'} <Star className="w-3 h-3 fill-amber-400" />
                  </span>
                </div>
              </div>
            </div>

            {inspectFeedback.detailedRatings && Object.keys(inspectFeedback.detailedRatings).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Tier 2 Ratings</h4>
                <div className="space-y-1.5 bg-[#0b0c1b] p-3 rounded-xl border border-purple-500/20 text-xs">
                  {Object.entries(inspectFeedback.detailedRatings).map(([key, score]) => {
                    const label = selectedEvent?.criteria?.find((c) => c.key === key)?.label || key;
                    return (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-purple-500/10 last:border-0">
                        <span className="text-slate-300">{label}</span>
                        <span className="font-bold text-purple-300 flex items-center gap-1">
                          {score} <Star className="w-3 h-3 fill-purple-300" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Full Text Remarks</h4>
              <div className="bg-[#0b0c1b] p-4 rounded-xl border border-purple-500/20 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {inspectFeedback.comment || 'No text comments were provided for this submission.'}
              </div>
            </div>
          </div>
        </div>
      )}

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        selectedEventId={selectedEvent?._id}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <EditEventModal
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
        event={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
}
