import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { NAGPUR_AREAS } from '../data/nagpurLocations';
import {
  Shield,
  User as UserIcon,
  HeartHandshake,
  Lock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Bike,
  Activity,
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser?: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('CITIZEN');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(true);

  // Common Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nagpurArea, setNagpurArea] = useState(NAGPUR_AREAS[0].name);
  const [customId, setCustomId] = useState(() => `NAG-CIT-${Math.floor(100 + Math.random() * 900)}`);

  // Volunteer specific
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'First Aid Certified',
    'Two-Wheeler Quick Response'
  ]);
  const [vehicle, setVehicle] = useState('Two-Wheeler (Motorcycle/Scooter)');

  // Login with existing ID
  const [existingIdOrPhone, setExistingIdOrPhone] = useState('');

  // Admin Login (user requirement: default admin24 / pass24)
  const [adminUsername, setAdminUsername] = useState('admin24');
  const [adminPassword, setAdminPassword] = useState('pass24');

  // Loading & Error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleRegenerateId = (role: UserRole) => {
    const prefix = role === 'VOLUNTEER' ? 'NAG-VOL' : 'NAG-CIT';
    setCustomId(`${prefix}-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'CITIZEN') {
      setCustomId(`NAG-CIT-${Math.floor(100 + Math.random() * 900)}`);
      if (!name) setName('Rohit Deshmukh');
      if (!phone) setPhone('+91 98220 12345');
    } else if (role === 'VOLUNTEER') {
      setCustomId(`NAG-VOL-${Math.floor(100 + Math.random() * 900)}`);
      if (!name) setName('Sameer Joshi');
      if (!phone) setPhone('+91 94221 67890');
    }
  };

  // Toggle Volunteer Skill
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // 1. Handle Registration of Citizen or Volunteer ID
  const handleRegisterId = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage('Please enter a valid mobile number (+91).');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAreaObj = NAGPUR_AREAS.find(a => a.name === nagpurArea) || NAGPUR_AREAS[0];

      const res = await fetch('/api/auth/register-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customId,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          role: activeRoleTab,
          nagpurArea: selectedAreaObj.name,
          skills: activeRoleTab === 'VOLUNTEER' ? selectedSkills : undefined,
          vehicle: activeRoleTab === 'VOLUNTEER' ? vehicle : undefined,
          currentLat: selectedAreaObj.lat,
          currentLng: selectedAreaObj.lng
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate ID');
      }

      setSuccessMessage(`ID Created! Welcome ${data.user.name} (${data.user.id})`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Login with Existing ID or Phone
  const handleLoginExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!existingIdOrPhone.trim()) {
      setErrorMessage('Please enter your Citizen/Volunteer ID or registered phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isPhone = /^\+?[0-9\s-]{8,}$/.test(existingIdOrPhone.trim());
      const payload = isPhone
        ? { phone: existingIdOrPhone.trim() }
        : { id: existingIdOrPhone.trim() };

      const res = await fetch('/api/auth/login-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'User ID not found');
      }

      setSuccessMessage(`Logged in as ${data.user.name} (${data.user.id})`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Admin Login (admin24 / pass24)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMessage('Please provide both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setSuccessMessage(`Authorized! Welcome ${data.user.name}`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Admin authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick preset login helper for panel demo
  const handleQuickDemoLogin = (userId: string) => {
    setExistingIdOrPhone(userId);
    setIsSubmitting(true);
    fetch('/api/auth/login-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          onLoginSuccess(data.user);
        } else {
          setErrorMessage(data.error || 'Demo login failed');
        }
      })
      .catch(err => setErrorMessage(err.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Header with Nagpur City Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          {currentUser && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close and keep current user"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white">SANKALP NAGPUR PORTAL</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  NAGPUR CITY, MAHARASHTRA
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                AI-Based Smart Adaptive Network for Community Assistance, Local Communication
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Coverage: 10 Municipal Zones of Nagpur • Zero Mile Central Control</span>
            </span>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            id="tab-btn-citizen-id"
            type="button"
            onClick={() => handleRoleTabChange('CITIZEN')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeRoleTab === 'CITIZEN'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Citizen ID</span>
          </button>

          <button
            id="tab-btn-volunteer-id"
            type="button"
            onClick={() => handleRoleTabChange('VOLUNTEER')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeRoleTab === 'VOLUNTEER'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Volunteer ID</span>
          </button>

          <button
            id="tab-btn-admin-login"
            type="button"
            onClick={() => handleRoleTabChange('ADMIN')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeRoleTab === 'ADMIN'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Admin Authority</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* TAB 1: CITIZEN / USER */}
          {activeRoleTab === 'CITIZEN' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Citizen Emergency Portal Access</h3>
                  <p className="text-xs text-slate-500">Report emergencies in Nagpur, get AI triage, and track live volunteers.</p>
                </div>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      isCreatingNew ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Make New ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      !isCreatingNew ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Login with ID
                  </button>
                </div>
              </div>

              {isCreatingNew ? (
                <form onSubmit={handleRegisterId} className="space-y-3.5">
                  {/* Generated ID Preview */}
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Allocated Citizen ID</span>
                      <span className="text-base font-black text-blue-900 font-mono">{customId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRegenerateId('CITIZEN')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change ID</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rohit Deshmukh"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (+91) *</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98220 12345"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Locality in Nagpur City *
                    </label>
                    <select
                      value={nagpurArea}
                      onChange={e => setNagpurArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {NAGPUR_AREAS.map(area => (
                        <option key={area.name} value={area.name}>
                          {area.name} ({area.zone}) - Near {area.landmark}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating ID...' : 'Generate Citizen ID & Enter Portal'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginExisting} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter Citizen ID or Registered Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={existingIdOrPhone}
                      onChange={e => setExistingIdOrPhone(e.target.value)}
                      placeholder="e.g. NAG-CIT-101 or +91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Logging in...' : 'Sign In with Citizen ID'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Quick Demo Profile (Nagpur):</p>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('NAG-CIT-101')}
                      className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left flex items-center justify-between transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Ananya Sharma</span>
                        <span className="text-[11px] text-slate-500">ID: NAG-CIT-101 • Dharampeth, West Nagpur</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600">Use Profile →</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: VOLUNTEER */}
          {activeRoleTab === 'VOLUNTEER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Volunteer Portal</h3>
                </div>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      isCreatingNew ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Make Volunteer ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      !isCreatingNew ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Volunteer Login
                  </button>
                </div>
              </div>

              {isCreatingNew ? (
                <form onSubmit={handleRegisterId} className="space-y-3">
                  {/* Generated ID Preview */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Assigned Volunteer Badge ID</span>
                      <span className="text-base font-black text-emerald-900 font-mono">{customId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRegenerateId('VOLUNTEER')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Change ID</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Volunteer Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Sameer Joshi"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (+91) *</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 94221 67890"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Nagpur Station / Base Sector *
                    </label>
                    <select
                      value={nagpurArea}
                      onChange={e => setNagpurArea(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      {NAGPUR_AREAS.map(area => (
                        <option key={area.name} value={area.name}>
                          {area.name} Station ({area.zone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills / Badges */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Emergency Assistance Skills</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'First Aid Certified',
                        'CPR Trained',
                        'Two-Wheeler Quick Response',
                        'Medical / Nursing Assist',
                        'Disaster Search & Rescue',
                        'Traffic & Crowd Management'
                      ].map(skill => {
                        const active = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                              active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Volunteer ID & Join Response Team'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginExisting} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter Volunteer ID or Registered Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={existingIdOrPhone}
                      onChange={e => setExistingIdOrPhone(e.target.value)}
                      placeholder="e.g. NAG-VOL-201 or +91 91234 56789"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Logging in...' : 'Sign In with Volunteer ID'}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Quick Demo Volunteers (Nagpur):</p>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('NAG-VOL-201')}
                        className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Rahul Verma</span>
                          <span className="text-[11px] text-slate-500">ID: NAG-VOL-201 • Sitabuldi Central Station</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">Sign In →</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin('NAG-VOL-202')}
                        className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Priya Patel</span>
                          <span className="text-[11px] text-slate-500">ID: NAG-VOL-202 • Medical Square GMCH Station</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">Sign In →</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN / AUTHORITY */}
          {activeRoleTab === 'ADMIN' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Admin Login</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    AUTHORITY ONLY
                  </span>
                </div>
              </div>

              {/* Requirement reminder badge */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold">Default System Admin</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono font-bold mt-1 text-slate-900 bg-white/80 p-2 rounded-lg border border-amber-200">
                  <span>Username: <span className="text-purple-700 font-extrabold">admin24</span></span>
                  <span>Password: <span className="text-purple-700 font-extrabold">pass24</span></span>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Username *</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    placeholder="admin24"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Password *</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="pass24"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying Credentials...' : 'Authenticate Command Center (admin24 / pass24)'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
