import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FeedbackForm from './pages/FeedbackForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <Routes>
          <Route path="/feedback/:eventId" element={<FeedbackForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}