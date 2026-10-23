import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import API from '../api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl max-w-sm w-full border border-slate-700 shadow-2xl">
        <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-center mb-1">ClubPulse Admin</h1>
        <p className="text-xs text-slate-400 text-center mb-6">CODEIO Technical Portal</p>
        
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 bg-slate-900 rounded-lg border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-slate-900 rounded-lg border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg transition">Sign In</button>
      </form>
    </div>
  );
}