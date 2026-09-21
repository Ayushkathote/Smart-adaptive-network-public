import React, { useState } from 'react';
import { Incident, User, EmergencyCategory } from '../types';
import { LeafletMap } from './LeafletMap';
import { NAGPUR_AREAS, NAGPUR_HELPLINES } from '../data/nagpurLocations';
import {
  AlertCircle,
  MapPin,
  Send,
  Camera,
  CheckCircle2,
  Clock,
  UserCheck,
  Navigation,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Phone
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  incidents: Incident[];
  onReportIncident: (data: any) => Promise<Incident>;
  onRefresh: () => void;
  isLoading: boolean;
}

const CATEGORIES: EmergencyCategory[] = [
  'Road Accident',
  'Fire',
  'Medical Emergency',
  'Flood',
  'Earthquake',
  'Missing Person',
  'Crime/Safety',
  'Other'
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  incidents,
  onReportIncident,
  onRefresh,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'REPORT' | 'MY_EMERGENCIES'>('REPORT');
  
  // Form State initialized for Nagpur City, Maharashtra
  const [title, setTitle] = useState('Road Accident Near Chhatrapati Square, Wardha Road');
  const [description, setDescription] = useState(
    'Two people are injured in a two-wheeler collision near Metro pillar. One person appears unconscious and immediate help is required.'
  );
  const [category, setCategory] = useState<EmergencyCategory>('Road Accident');
  const [affectedPeople, setAffectedPeople] = useState(2);
  const [latitude, setLatitude] = useState(21.1090);
  const [longitude, setLongitude] = useState(79.0680);
  const [address, setAddress] = useState('Near Chhatrapati Square Flyover, Wardha Road, South Nagpur, Maharashtra');
  const [isLocating, setIsLocating] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);
  const [selectedIncidentForMap, setSelectedIncidentForMap] = useState<Incident | null>(null);

  // Filter only user's incidents
  const myIncidents = incidents.filter(
    inc => inc.reportedBy.userId === currentUser.id || inc.reportedBy.userName === currentUser.name
  );

  // Capture GPS
  const handleCaptureGps = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. You can select a Nagpur landmark or enter coordinates.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setAddress(`Live GPS Captured: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Nagpur)`);
        setIsLocating(false);
      },
      err => {
        console.warn('GPS error, keeping default coordinates', err);
        alert(`Location permission denied or unavailable (${err.message}). Using selected Nagpur coordinates.`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick select Nagpur area
  const handleSelectNagpurArea = (areaName: string) => {
    const found = NAGPUR_AREAS.find(a => a.name === areaName);
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lng);
      setAddress(`${found.landmark}, ${found.name}, Nagpur, Maharashtra`);
    }
  };

  // Preset scenarios helper for easy college demo in Nagpur
  const loadPresetScenario = (type: 'accident' | 'fire' | 'medical') => {
    if (type === 'accident') {
      setTitle('Road Accident Near Chhatrapati Square, Wardha Road');
      setDescription('Two people are injured in a two-wheeler collision near Metro pillar. One person appears unconscious and immediate ambulance assistance is needed.');
      setCategory('Road Accident');
      setAffectedPeople(2);
      setLatitude(21.1090);
      setLongitude(79.0680);
      setAddress('Near Chhatrapati Square Flyover, Wardha Road, South Nagpur, Maharashtra');
    } else if (type === 'fire') {
      setTitle('Commercial Godown Fire at Gandhibagh, Itwari');
      setDescription('LPG cylinder blast in cloth market storage warehouse. Thick black smoke spreading towards congested residential lanes.');
      setCategory('Fire');
      setAffectedPeople(4);
      setLatitude(21.1520);
      setLongitude(79.1150);
      setAddress('Cloth Market Lane 4, Gandhibagh, Itwari, East Nagpur, Maharashtra');
    } else {
      setTitle('Cardiac Arrest at Sitabuldi Metro Station Platform');
      setDescription('Commuter collapsed suddenly near ticket gate at Zero Mile Metro interchange. Pulse weak, CPR administered.');
      setCategory('Medical Emergency');
      setAffectedPeople(1);
      setLatitude(21.1458);
      setLongitude(79.0882);
      setAddress('Platform 1 Concourse, Sitabuldi Metro Interchange, Zero Mile, Nagpur, Maharashtra');
    }
  };

  // Submit Emergency
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please enter both emergency title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newInc = await onReportIncident({
        title,
        description,
        category,
        latitude,
        longitude,
        address,
        affectedPeople,
        evidenceImage: evidenceImage || undefined,
        reportedBy: {
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone
        }
      });
      setSubmittedIncident(newInc);
      setActiveTab('MY_EMERGENCIES');
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Citizen Welcome & Mode Switch */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-200" />
              Role 1: Citizen / User Portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Community Emergency Reporting</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Report emergencies with instant GPS capture. The SANKALP AI NLP pipeline automatically triages
              severity, immediately alerts district authorities, and dispatches verified community volunteers.
            </p>
          </div>

          {/* Quick Tab Selector */}
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setActiveTab('REPORT')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'REPORT' ? 'bg-white text-blue-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              🚨 Report Emergency
            </button>
            <button
              onClick={() => setActiveTab('MY_EMERGENCIES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'MY_EMERGENCIES' ? 'bg-white text-blue-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              📋 My Emergencies
              {myIncidents.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  {myIncidents.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: REPORT EMERGENCY FORM */}
      {activeTab === 'REPORT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Emergency Incident Details</h2>
                <p className="text-xs text-slate-500">Provide accurate details to expedite nearest responder dispatch.</p>
              </div>
              
              {/* College Demo Presets helper */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 px-2">Demo Preset:</span>
                <button
                  type="button"
                  onClick={() => loadPresetScenario('accident')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 rounded text-slate-700 font-medium border border-slate-200 text-[11px]"
                >
                  🚗 Road Accident
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetScenario('fire')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 rounded text-slate-700 font-medium border border-slate-200 text-[11px]"
                >
                  🔥 Fire
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetScenario('medical')}
                  className="px-2 py-1 bg-white hover:bg-slate-100 rounded text-slate-700 font-medium border border-slate-200 text-[11px]"
                >
                  ❤️ Medical
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Emergency Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Road Accident Near Main Road"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Emergency Description (Analyzed by AI NLP Pipeline) *
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                    <Sparkles className="w-3 h-3" /> TF-IDF Auto Triage
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what happened, injuries, trapped individuals, and urgency..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Category & Affected People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Emergency Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as EmergencyCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Number of People Affected *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={affectedPeople}
                    onChange={e => setAffectedPeople(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Geolocation Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Incident Location (GPS Coordinates)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Detecting GPS...' : 'Capture My GPS'}
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Quick Nagpur Locality Selector:
                    </label>
                    <span className="text-[10px] text-blue-600 font-semibold">Click to auto-fill GPS</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {NAGPUR_AREAS.slice(0, 8).map(area => (
                      <button
                        key={area.name}
                        type="button"
                        onClick={() => handleSelectNagpurArea(area.name)}
                        className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          address.includes(area.name)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Address or landmark description..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={e => setLatitude(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={e => setLongitude(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Evidence */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Optional Evidence / Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={evidenceImage}
                    onChange={e => setEvidenceImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or leave empty"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEvidenceImage(
                        'https://images.unsplash.com/photo-1590483736427-4a0bdf19660d?w=500&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" /> Sample Photo
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-emergency"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Registering Emergency & Triaging with AI...' : 'SUBMIT EMERGENCY REPORT'}
              </button>
            </form>
          </div>

          {/* Side Preview & Map */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                Selected Location Preview
              </h3>
              <LeafletMap
                incidents={[
                  {
                    id: 'PREVIEW-PIN',
                    title: title || 'Emergency Location',
                    description: description || 'Emergency incident location preview',
                    category,
                    priority: 'HIGH',
                    status: 'SUBMITTED',
                    latitude,
                    longitude,
                    address,
                    affectedPeople,
                    reportedBy: { userId: currentUser.id, userName: currentUser.name, userPhone: currentUser.phone },
                    aiAnalysis: {
                      category,
                      priority: 'HIGH',
                      confidence: 95,
                      keywords: ['location', 'incident'],
                      categoryProbabilities: {},
                      explanation: 'Coordinate preview',
                      model: 'Leaflet'
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    timeline: []
                  } as Incident
                ]}
                height="220px"
                zoom={14}
                center={[latitude, longitude]}
                showRoute={false}
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Coordinates will be sent to the volunteer dashboard and district administration center.
              </p>
            </div>

            {/* Nagpur City Emergency Helplines */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <PhoneCall className="w-4 h-4 text-amber-600" />
                Nagpur Official Emergency Helplines
              </div>
              <div className="space-y-1.5 pt-1">
                {NAGPUR_HELPLINES.slice(0, 4).map(hl => (
                  <div key={hl.service} className="flex items-center justify-between text-[11px] bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-100">
                    <span className="font-medium text-slate-800">{hl.service}</span>
                    <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                      {hl.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MY EMERGENCIES (VIEW STATUS, VOLUNTEER, RESOLUTION) */}
      {activeTab === 'MY_EMERGENCIES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Emergency Reports</h2>
              <p className="text-xs text-slate-500">Live monitoring of your reported incidents and assigned help.</p>
            </div>
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {myIncidents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Emergencies Reported Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                You have not submitted any active emergency reports. Click below to submit your first incident.
              </p>
              <button
                onClick={() => setActiveTab('REPORT')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Report an Emergency Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Incidents List */}
              <div className="lg:col-span-7 space-y-4">
                {myIncidents.map(inc => {
                  const isResolved = inc.status === 'RESOLVED';
                  const isAssigned = inc.status !== 'SUBMITTED';

                  return (
                    <div
                      key={inc.id}
                      className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                        selectedIncidentForMap?.id === inc.id
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {inc.id}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                inc.priority === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : inc.priority === 'HIGH'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-900'
                              }`}
                            >
                              {inc.priority} PRIORITY
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-1">{inc.title}</h3>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : inc.status === 'HELP_STARTED'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : inc.status === 'ON_THE_WAY'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : inc.status === 'ASSIGNED'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isResolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {inc.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{inc.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {inc.address}
                        </span>
                        <span>&bull;</span>
                        <span>{inc.category}</span>
                        <span>&bull;</span>
                        <span>{inc.affectedPeople} affected</span>
                      </div>

                      {/* ASSIGNED VOLUNTEER INFO */}
                      {inc.assignedVolunteer ? (
                        <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              {inc.assignedVolunteer.volunteerName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-blue-900">
                                  {inc.assignedVolunteer.volunteerName}
                                </span>
                                <span className="text-[10px] bg-blue-200 text-blue-800 font-semibold px-1.5 rounded">
                                  Assigned Volunteer
                                </span>
                              </div>
                              <p className="text-[11px] text-blue-700">
                                Response Stage: <strong>{inc.assignedVolunteer.currentStatus.replace(/_/g, ' ')}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${inc.assignedVolunteer.volunteerPhone}`}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                            >
                              <PhoneCall className="w-3 h-3" />
                              Call Help
                            </a>
                            <button
                              onClick={() => setSelectedIncidentForMap(inc)}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200"
                            >
                              View Map
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Awaiting volunteer assignment. Broadcasted to nearby volunteers.
                          </span>
                          <button
                            onClick={() => setSelectedIncidentForMap(inc)}
                            className="text-xs font-semibold text-amber-800 underline"
                          >
                            View on Map
                          </button>
                        </div>
                      )}

                      {/* RESOLVED STATE DETAILS */}
                      {isResolved && (
                        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Emergency Response Completed &amp; Verified
                          </div>
                          <p className="text-emerald-800 mt-1">{inc.resolutionMessage}</p>
                          {inc.resolvedAt && (
                            <p className="text-[11px] text-emerald-600 mt-1">
                              Resolved at: {new Date(inc.resolvedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Map & Live Volunteer Tracking */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs sticky top-20">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
                    <span>Incident Spatial Map</span>
                    {selectedIncidentForMap && (
                      <span className="text-xs font-mono text-blue-600 font-semibold">
                        {selectedIncidentForMap.id}
                      </span>
                    )}
                  </h3>

                  <LeafletMap
                    selectedIncident={selectedIncidentForMap || myIncidents[0]}
                    volunteerLocation={
                      (selectedIncidentForMap || myIncidents[0])?.assignedVolunteer
                        ? {
                            lat: (selectedIncidentForMap || myIncidents[0]).assignedVolunteer!.volunteerLat,
                            lng: (selectedIncidentForMap || myIncidents[0]).assignedVolunteer!.volunteerLng,
                            name: (selectedIncidentForMap || myIncidents[0]).assignedVolunteer!.volunteerName
                          }
                        : null
                    }
                    height="320px"
                    zoom={14}
                    showRoute={true}
                  />

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-semibold text-slate-700">Map Legend:</p>
                    <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1">🚨 Emergency Target</span>
                      <span className="flex items-center gap-1">🚶 Assigned Volunteer</span>
                      <span className="flex items-center gap-1">✅ Resolved</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};
