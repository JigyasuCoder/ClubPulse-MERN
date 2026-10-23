import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, CheckCircle, Lock, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import API from '../api';

export default function FeedbackForm() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Navigation State (Page 1 = Quick Review, Page 2 = Deeper Feedback)
  const [pageStep, setPageStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ratings & Per-Question Comments State
  const [coreRatings, setCoreRatings] = useState({ overall: 5, organization: 5, content: 5 });
  const [detailedRatings, setDetailedRatings] = useState({});
  const [detailedComments, setDetailedComments] = useState({});
  const [comment, setComment] = useState('');

  useEffect(() => {
    API.get(`/events/${eventId}`)
      .then((res) => {
        setEvent(res.data);
        if (!res.data.passcode) setIsUnlocked(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === event?.passcode) {
      setIsUnlocked(true);
    } else {
      alert('Invalid event passcode');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Compile comments into a consolidated text payload
    const combinedComments = Object.entries(detailedComments)
      .filter(([_, val]) => val.trim().length > 0)
      .map(([key, val]) => {
        const itemLabel = event.criteria.find((c) => c.key === key)?.label || key;
        return `[${itemLabel}]: ${val}`;
      })
      .join('\n');

    const finalComment = [comment, combinedComments].filter(Boolean).join('\n\n');

    try {
      await API.post('/feedback', {
        eventId,
        coreRatings,
        detailedRatings: pageStep === 2 ? detailedRatings : {},
        comment: finalComment,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-300">Loading event info...</div>;
  if (!event) return <div className="p-8 text-center text-red-400">Event not found or inactive.</div>;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
        <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
        <p className="text-slate-400 max-w-sm">
          Your anonymous feedback has been recorded to help CODEIO improve future workshops.
        </p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <form onSubmit={handleUnlock} className="bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-700 shadow-xl">
          <Lock className="w-10 h-10 text-indigo-400 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-center mb-2">{event.title}</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Enter event passcode to access feedback form</p>
          <input
            type="password"
            placeholder="Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
          />
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition">
            Unlock Form
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 py-8">
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
        {/* Header */}
        <div className="border-b border-slate-700 pb-4 flex justify-between items-start">
          <div>
            <span className="text-xs uppercase px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-full font-semibold">
              {event.eventType}
            </span>
            <h1 className="text-2xl font-bold mt-2">{event.title}</h1>
            <p className="text-slate-400 text-xs mt-1">{event.description}</p>
          </div>
          <span className="text-xs text-indigo-300 font-bold bg-slate-900 px-3 py-1 rounded-lg">
            Page {pageStep} of {event.criteria?.length > 0 ? 2 : 1}
          </span>
        </div>

        {/* PAGE 1: QUICK RATINGS */}
        {pageStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-indigo-300">Quick Ratings</h3>
            {[
              { key: 'overall', label: 'Overall Experience' },
              { key: 'organization', label: 'Event Organization' },
              { key: 'content', label: 'Content & Value' },
            ].map(({ key, label }) => (
              <div key={key} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <span className="text-sm font-medium text-slate-200">{label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer p-1">
                      <input
                        type="radio"
                        name={`core-${key}`}
                        value={star}
                        checked={coreRatings[key] === star}
                        onChange={() => setCoreRatings({ ...coreRatings, [key]: star })}
                        className="sr-only"
                      />
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (coreRatings[key] || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Overall Remarks (Optional)</label>
              <textarea
                rows={3}
                placeholder="What went well or what could be improved?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs focus:outline-none text-slate-100"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 transition text-slate-200"
              >
                <Send className="w-4 h-4" /> Quick Submit
              </button>

              {event.criteria?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPageStep(2)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl flex items-center justify-center gap-2 transition text-white shadow-lg"
                >
                  Provide Deeper Feedback <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* PAGE 2: DEEPER FEEDBACK WITH OPTIONAL PER-QUESTION REMARKS */}
        {pageStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-indigo-300">Detailed Criteria Evaluation</h3>
              <button
                type="button"
                onClick={() => setPageStep(1)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Quick Review
              </button>
            </div>

            <div className="space-y-5">
              {event.criteria.map((item, idx) => (
                <div key={item.key} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">
                      {idx + 1}. {item.label}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className="cursor-pointer p-0.5">
                          <input
                            type="radio"
                            name={`detailed-${item.key}`}
                            value={star}
                            checked={detailedRatings[item.key] === star}
                            onChange={() =>
                              setDetailedRatings({ ...detailedRatings, [item.key]: star })
                            }
                            className="sr-only"
                          />
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              star <= (detailedRatings[item.key] || 0)
                                ? 'fill-indigo-400 text-indigo-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Optional Descriptive Remark Input for Each Specific Question */}
                  <input
                    type="text"
                    placeholder="Optional specific remarks for this question..."
                    value={detailedComments[item.key] || ''}
                    onChange={(e) =>
                      setDetailedComments({ ...detailedComments, [item.key]: e.target.value })
                    }
                    className="w-full p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition text-white"
            >
              <Send className="w-4 h-4" /> Submit Complete Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}