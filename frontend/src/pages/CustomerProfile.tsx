import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Key,
  CheckCircle2,
  Building2,
  CreditCard,
  Lock,
  Phone,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Alex Turner');
  const [email, setEmail] = useState(user?.email || 'customer@finassist360.bank');
  const [phone, setPhone] = useState('+91 98201 44819');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/customer/profile', {
        full_name: fullName,
        email: email,
        phone: phone
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-navy-800" /> My Customer Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review customer authentication credentials, KYC status, and security preferences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-navy-800 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{fullName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> KYC Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Username: <strong className="text-slate-800 font-mono">{user?.username || 'user'}</strong> • Account Role: <strong className="text-teal-700">Retail Banking Customer</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer ID</span>
            <span className="font-mono font-bold text-slate-800 text-sm">CUST-84920481</span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Registered Mobile Number (2FA)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Home Branch & IFSC</label>
              <input
                type="text"
                disabled
                value="Bandra Kurla Complex Branch • FINB0002910"
                className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              Changes to registered mobile or email trigger SMS OTP verification.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </form>

        {/* Security & Audit Guidance */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-navy-700" /> Platform Security & Access Control
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">Biometric / Device Binding</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Active on iPhone 15 Pro. Reset device token via Service Requests.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-800 block">RBAC Permission Boundary</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Strict customer ownership enforcement. Internal logs & other accounts hidden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
