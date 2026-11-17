import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-navy-950">
          FinAssist <span className="text-navy-600">360</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 uppercase font-semibold tracking-wider">
          GenAI-Based Banking Service Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign in to Console'}
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              One-Click Demo Account Sign-In:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-navy-900">Admin</div>
                <div className="text-[10px] text-slate-500">admin / Admin@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('manager', 'Manager@123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-navy-900">Service Manager</div>
                <div className="text-[10px] text-slate-500">manager / Manager@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('agent', 'Agent@123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-navy-900">Support Agent</div>
                <div className="text-[10px] text-slate-500">agent / Agent@123</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('tech', 'Tech@123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 text-left"
              >
                <div className="font-bold text-navy-900">Tech Engineer</div>
                <div className="text-[10px] text-slate-500">tech / Tech@123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
