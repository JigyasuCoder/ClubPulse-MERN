import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Bot, LogOut, Plus, Filter, Search, ArrowLeft, Calendar,
  MessageSquare, Key, Settings, Star, Eye, X, ChevronRight
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

  // Helper to calculate star distribution for a given field
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

  // Filter feedback items
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
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-3">
          {selectedEvent && (
            <button
              onClick={() => setSelectedEvent(null)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition text-slate-300 cursor-pointer"
              title="Back to Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">ClubPulse Admin Portal</h1>
            <p className="text-xs text-slate-400">
              {selectedEvent ? `Viewing: ${selectedEvent.title}` : 'CODEIO Event Insights'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer text-white"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-slate-700 hover:bg-red-600/80 rounded-xl transition text-slate-300 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW 1: EVENT CARDS GRID */}
      {!selectedEvent ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">All Events</h2>
            <span className="text-xs text-slate-400">{events.length} Total Events</span>
          </div>

          {events.length === 0 ? (
            <div className="bg-slate-800 p-12 text-center rounded-2xl border border-slate-700 text-slate-400">
              No events found. Click "+ Create Event" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((evt) => (
                <div
                  key={evt._id}
                  onClick={() => setSelectedEvent(evt)}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/80 p-5 rounded-2xl shadow-lg transition hover:-translate-y-1 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full uppercase border border-indigo-500/30">
                        {evt.eventType || 'Event'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(evt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{evt.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description || 'No description provided.'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex justify-between items-center text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-indigo-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>{evt.feedbackCount || 0} Feedbacks</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Key className="w-3.5 h-3.5" />
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
        <div className="space-y-6">
          {/* Top Event Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 md:col-span-2 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{selectedEvent.eventType}</span>
                <button
                  onClick={() => setIsEditEventOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg text-indigo-300 transition cursor-pointer"
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
                    className="text-indigo-400 underline"
                  >
                    {`${window.location.origin}/feedback/${selectedEvent._id}`}
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
              <QRCodeSVG
                value={`${window.location.origin}/feedback/${selectedEvent._id}`}
                size={110}
                className="p-2 bg-white rounded-xl mb-2"
              />
              <span className="text-xs text-slate-400 font-medium">Scan QR Code</span>
            </div>
          </div>

          {/* RATING DISTRIBUTION GRAPHS (TIER 1 & TIER 2 SEPARATED) */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Rating Distribution Analytics
            </h2>

            {/* Tier 1 Core Graphs */}
            <div>
              <h3 className="text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wider">
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
                      className={`bg-slate-900/80 p-4 rounded-xl border transition cursor-pointer ${
                        selectedQuestionFilter === key ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-200">{label}</span>
                        {selectedQuestionFilter === key && <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded-full font-bold">Filtered</span>}
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey="stars" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
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

            {/* Tier 2 Detailed Criteria Graphs */}
            {selectedEvent.criteria?.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wider">
                  Tier 2: Detailed Questions Ratings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedEvent.criteria.map((item) => {
                    const chartData = getRatingDistribution(item.key, true);
                    return (
                      <div
                        key={item.key}
                        onClick={() => setSelectedQuestionFilter(item.key)}
                        className={`bg-slate-900/80 p-4 rounded-xl border transition cursor-pointer ${
                          selectedQuestionFilter === item.key ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-200 line-clamp-1">{item.label}</span>
                          {selectedQuestionFilter === item.key && <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-2 py-0.5 rounded-full font-bold">Filtered</span>}
                        </div>
                        <div className="h-28 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <XAxis dataKey="stars" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
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

          {/* CATEGORIZED FEEDBACK LIST & DRILL-DOWN */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
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
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
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
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-xl flex items-center gap-1 cursor-pointer"
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-xs focus:outline-none text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Feedback Entries Grid */}
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
                    className="bg-slate-900 p-4 rounded-xl border border-slate-700/60 space-y-3 hover:border-indigo-500/70 transition cursor-pointer group"
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
                        <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-3">
                      {item.comment || 'No text remarks provided.'}
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-indigo-400 font-semibold">
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

      {/* FULL FEEDBACK INSPECTION MODAL */}
      {inspectFeedback && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 w-full max-w-xl p-6 rounded-2xl border border-slate-700 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
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

            {/* Core Ratings Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Tier 1 Ratings</h4>
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-900 p-3 rounded-xl border border-slate-700/60">
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

            {/* Detailed Questions Breakdown */}
            {inspectFeedback.detailedRatings && Object.keys(inspectFeedback.detailedRatings).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Tier 2 Ratings</h4>
                <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-700/60 text-xs">
                  {Object.entries(inspectFeedback.detailedRatings).map(([key, score]) => {
                    const label = selectedEvent?.criteria?.find((c) => c.key === key)?.label || key;
                    return (
                      <div key={key} className="flex justify-between items-center py-1 border-b border-slate-800 last:border-0">
                        <span className="text-slate-300">{label}</span>
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          {score} <Star className="w-3 h-3 fill-indigo-400" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Comment / Detailed Text Remarks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Full Text Remarks</h4>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {inspectFeedback.comment || 'No text comments were provided for this submission.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant, Create, and Edit Modals */}
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