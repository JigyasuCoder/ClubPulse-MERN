import { useState, useEffect } from 'react'; // Added useEffect import
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
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-2xl transition hover:scale-105 cursor-pointer"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold">Ask AI Assistant</span>
          <Maximize2 className="w-3.5 h-3.5 ml-1" />
        </button>
      ) : (
        /* Expanded Chat Box Widget */
        <div className="bg-slate-800 w-[420px] sm:w-[500px] h-40 p-3 rounded-2xl border border-slate-700 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center pb-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-600/30 rounded-lg">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="font-bold text-xs text-white">ClubPulse Assistant</h2>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              title="Minimize Assistant"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-1 text-xs">
            {messages.length === 0 && (
              <p className="text-slate-400 text-center mt-2 px-2 text-[11px]">
                Ask questions about attendees' feedback, complaints, or speaker quality.
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-[11px] ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white ml-8'
                    : 'bg-slate-900 border border-slate-700 text-slate-200 mr-8'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-indigo-400 p-1 text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing feedback...
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="flex gap-2 pt-1 border-t border-slate-700">
            <input
              type="text"
              placeholder="Ask AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 p-1.5 bg-slate-900 rounded-lg border border-slate-700 text-xs focus:outline-none text-slate-100"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-xs font-semibold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}