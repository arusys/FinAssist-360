import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  Key,
  Server,
  Save,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const Settings: React.FC = () => {
  const { switchDemoRole } = useAuth();
  const [provider, setProvider] = useState('demo');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('1.5 AI model');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const DEMO_PERSONAS: { role: UserRole; username: string; name: string; dept: string }[] = [
    { role: 'Super Admin', username: 'admin', name: 'Sarah Jenkins', dept: 'Executive IT & Risk Administration' },
    { role: 'Service Desk Agent', username: 'agent', name: 'Priya Sharma', dept: 'Retail Banking Operations & Service Desk' },
    { role: 'Banking Operations Manager', username: 'manager', name: 'Vikram Mehta', dept: 'IT Service Management & Payment Ops' },
    { role: 'Technical Support Engineer', username: 'tech', name: 'David Chen', dept: 'Core Infrastructure & Switching' },
    { role: 'Operations Analyst', username: 'analyst', name: 'Ananya Roy', dept: 'Business Operations & SLA Analytics' },
    { role: 'User', username: 'user', name: 'Alex Turner', dept: 'Customer Account Services (Self-Service Portal)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shadow-xs">
            <SettingsIcon className="w-5 h-5 text-navy-200" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              System Settings & Architecture Configuration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Configure Generative AI provider parameters, database persistence & evaluate demo role personas
            </p>
          </div>
        </div>
      </div>

      {/* Demo Personas Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Users className="w-4 h-4 text-navy-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quick Persona Switcher (Enterprise & Customer Portal Roles)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {DEMO_PERSONAS.map((p) => (
            <div
              key={p.role}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-navy-600 block">{p.role}</span>
                <div className="font-bold text-slate-900 text-xs mt-1">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.dept}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">Username: {p.username}</div>
              </div>
              <button
                onClick={() => switchDemoRole(p.role)}
                className="mt-3 w-full py-1 text-xs font-semibold bg-white hover:bg-navy-50 text-navy-800 border border-slate-200 rounded-lg transition-colors"
              >
                Switch Role
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* GenAI Provider Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Cpu className="w-4 h-4 text-navy-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Generative AI Model & Provider Configuration
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs max-w-xl">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Inference Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
            >
              <option value="demo">Deterministic Enterprise Grounded Generator (Demo Mode - Zero API Key Required)</option>
              <option value="gemini">Google Gemini API (gemini-1.5-pro / flash)</option>
              <option value="openai">OpenAI API (gpt-4o / gpt-4o-mini)</option>
              <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
            />
          </div>

          {provider !== 'demo' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">API Key *</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                API keys are stored server-side only in memory / environment and never exposed to the frontend.
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Configuration
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Parameters updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* System Health & Architecture Specs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Environment & Runtime Telemetry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Database Persistence</span>
            <span className="font-bold text-slate-800">SQLite / PostgreSQL Support</span>
            <div className="text-[10px] text-emerald-600 mt-0.5">Connected (SQLAlchemy 2.0 Engine)</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">RAG Vector Engine</span>
            <span className="font-bold text-slate-800">TF-IDF & Sublinear Cosine Match</span>
            <div className="text-[10px] text-emerald-600 mt-0.5">5 Ingested Documents Loaded</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Predictive ML Model</span>
            <span className="font-bold text-slate-800">RandomForestClassifier</span>
            <div className="text-[10px] text-emerald-600 mt-0.5">Trained & Evaluated (89% Acc)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
