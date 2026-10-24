import { useState, useEffect } from 'react';
import { Bot, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import API from '../api';

export default function AiAssistantModal({ isOpen, selectedEventId }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Reset to miniature mode whenever a new event is opened
  useEffect(() => {
    setIsMinimized(true);
  }, [selectedEventId]);

  if (!isOpen) return null;

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await API.post('/ai/query', {
        eventId: selectedEventId || null,
        userQuery: userText,
      });
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process AI insights request.';
      setMessages((prev) => [...prev, { role: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Minimized Floating Miniature Button */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:opacity-90 text-white px-4 py-3 rounded-full shadow-2xl transition hover:scale-105 cursor-pointer shadow-rose-500/25"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold">Ask AI Assistant</span>
          <Maximize2 className="w-3.5 h-3.5 ml-1" />
        </button>
      ) : (
        /* Expanded Original Size Chat Box Widget */
        <div className="bg-[#12132b] w-[90vw] sm:w-[450px] md:w-[500px] h-[600px] max-h-[75vh] p-4 rounded-2xl border border-purple-500/30 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Bot className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">ClubPulse AI Assistant</h2>
                <p className="text-[10px] text-slate-400">Event Analytics & Feedback Insights</p>
              </div>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-[#181a3a] rounded-lg text-slate-400 hover:text-white transition cursor-pointer border border-transparent hover:border-purple-500/20"
              title="Minimize Assistant"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 text-xs">
            {messages.length === 0 && (
              <div className="text-slate-400 text-center my-auto py-12 px-4 space-y-2">
                <Bot className="w-8 h-8 text-rose-400/60 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-300">How can I assist you with this event?</p>
                <p className="text-[11px] text-slate-400">
                  Ask questions about attendee feedback trends, logistics issues, or speaker ratings.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white ml-8 shadow-md'
                    : 'bg-[#0b0c1b] border border-purple-500/20 text-slate-200 mr-8 shadow-md'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-rose-400 p-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing attendee feedback...
              </div>
            )}
          </div>

          {/* Form / Prompt Input */}
          <form onSubmit={handleAsk} className="flex gap-2 pt-2 border-t border-purple-500/20">
            <input
              type="text"
              placeholder="Ask questions about feedback..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#0b0c1b] rounded-xl border border-purple-500/20 text-xs focus:outline-none focus:border-rose-400 text-slate-100 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 hover:opacity-90 text-white rounded-xl transition text-xs font-semibold cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
