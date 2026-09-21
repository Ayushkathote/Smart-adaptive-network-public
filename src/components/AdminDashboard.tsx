import React, { useState } from 'react';
import { Incident, User, IncidentStatus } from '../types';
import { LeafletMap } from './LeafletMap';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  BrainCircuit,
  Filter,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  incidents: Incident[];
  onResolveIncident: (incidentId: string, notes?: string) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  incidents,
  onResolveIncident,
  onRefresh,
  isLoading
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    incidents.length > 0 ? incidents[0].id : null
  );
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState(
    'Ambulance and paramedical team reached site. Patient stabilized and transferred to GMCH Nagpur. Road traffic cleared by Nagpur Traffic Police.'
  );

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (filterCategory !== 'ALL' && inc.category !== filterCategory) return false;
    if (filterPriority !== 'ALL' && inc.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'ACTIVE' && inc.status === 'RESOLVED') return false;
      if (filterStatus === 'RESOLVED' && inc.status !== 'RESOLVED') return false;
      if (filterStatus === 'SUBMITTED' && inc.status !== 'SUBMITTED') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Key metrics
  const totalCount = incidents.length;
  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter(i => (i.priority === 'CRITICAL' || i.priority === 'HIGH') && i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  const handleResolve = async (incidentId: string) => {
    setIsResolving(true);
    try {
      await onResolveIncident(incidentId, resolutionNotes);
    } catch (err: any) {
      alert(`Could not resolve incident: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* METRIC COUNTERS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Incidents</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Logged in Database</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs bg-amber-50/30">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Active Emergencies</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600">{activeCount}</span>
            <span className="text-[10px] text-amber-600 font-semibold">Live in Field</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs bg-red-50/30">
          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">High / Critical Priority</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-red-600">{criticalCount}</span>
            <span className="text-[10px] text-red-500 font-bold animate-pulse">URGENT ATTENTION</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs bg-emerald-50/30">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved &amp; Closed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-600">{resolvedCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Verified Safe</span>
          </div>
        </div>
      </div>

      {/* MASTER OPENSTREETMAP LEAFLET MAP SHOWING ALL DISTRICT INCIDENTS */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Master District Spatial Overview Map
            </h3>
            <p className="text-xs text-slate-500">Live multi-marker map rendered with Leaflet.js &amp; OpenStreetMap.</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-red-600 font-medium">🚨 Active Incidents</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">✅ Resolved Incidents</span>
          </div>
        </div>

        <LeafletMap
          incidents={incidents}
          selectedIncident={null}
          height="340px"
          zoom={13}
          center={[28.6139, 77.2090]}
          showRoute={false}
        />
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident ID, title, address, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Incidents</option>
            <option value="SUBMITTED">Newly Submitted</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="Road Accident">Road Accident</option>
            <option value="Fire">Fire</option>
            <option value="Medical Emergency">Medical</option>
            <option value="Flood">Flood</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Missing Person">Missing Person</option>
            <option value="Crime/Safety">Crime/Safety</option>
          </select>

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 flex items-center gap-1.5 transition-colors"
            title="Sync live emergency feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Feeds</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: INCIDENT FEED & DETAILED AUDIT TIMELINE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INCIDENT LIST (STEP 2: AUTO-APPEAR) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Emergency Dispatch Queue ({filteredIncidents.length})
            </h3>
            <span className="text-xs text-slate-400">Select to inspect audit logs</span>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map(inc => {
              const isSelected = selectedIncident?.id === inc.id;
              const isNew = inc.status === 'SUBMITTED';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {inc.id}
                        </span>
                        {isNew && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
                            NEW EMERGENCY
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            inc.priority === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : inc.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {inc.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{inc.title}</h4>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inc.status === 'SUBMITTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{inc.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{inc.category} &bull; {inc.affectedPeople} affected</span>
                    <span>{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: STEP 8 RESPONSE TIMELINE & STEP 9 RESOLUTION */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              
              {/* Incident Title & Meta */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                      {selectedIncident.id}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                      {selectedIncident.category}
                    </span>
                    <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                      {selectedIncident.priority} PRIORITY
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {selectedIncident.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedIncident.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{selectedIncident.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reported By:</span>
                    <span className="font-semibold text-slate-800">{selectedIncident.reportedBy.userName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location / GPS:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Volunteer:</span>
                    <span className="font-semibold text-blue-700">
                      {selectedIncident.assignedVolunteer?.volunteerName || 'None (Unassigned)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI TRIAGE EXPLAINABILITY CARD */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-indigo-900">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    AI Triage Model Output (scikit-learn TF-IDF + Naive Bayes)
                  </div>
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    {selectedIncident.aiAnalysis.confidence}% Confidence
                  </span>
                </div>
                <p className="text-indigo-900">{selectedIncident.aiAnalysis.explanation}</p>
                <div className="flex items-center gap-2 text-[11px] text-indigo-800 pt-1">
                  <span className="font-semibold">Key TF-IDF Term Drivers:</span>
                  {selectedIncident.aiAnalysis.keywords.map(kw => (
                    <span key={kw} className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-mono">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* STEP 8: REAL AUDIT RESPONSE TIMELINE (FROM DATABASE) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Step 8: Verified Response Timeline (Real Database Logs)
                  </h3>
                  <span className="text-[11px] text-slate-400">Audit Trail Record</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedIncident.timeline.map((act, index) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center text-[8px] font-bold text-purple-700">
                        {index + 1}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{act.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(act.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600">{act.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>
                            Actor: <strong>{act.actorName}</strong> ({act.actorRole})
                          </span>
                          {act.statusAfter && (
                            <span className="font-mono font-semibold text-purple-700">
                              Status &rarr; {act.statusAfter}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 9: RESOLUTION CONTROLS (ADMIN RESOLVES INCIDENT) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Step 9: Incident Resolution &amp; Verification Action
                  </h4>
                  {selectedIncident.status === 'RESOLVED' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ALREADY RESOLVED
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold">Pending Authority Closure</span>
                  )}
                </div>

                {selectedIncident.status !== 'RESOLVED' ? (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={e => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution notes, paramedic summary, or hospital transfer..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />

                    <button
                      id="btn-admin-resolve"
                      disabled={isResolving}
                      onClick={() => handleResolve(selectedIncident.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isResolving ? 'Updating Database & Verifying...' : 'MARK AS RESOLVED (Authority Verification)'}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <p className="text-emerald-900 font-semibold">
                      {selectedIncident.resolutionMessage || 'Emergency response completed and verified.'}
                    </p>
                    {selectedIncident.resolvedAt && (
                      <p className="text-[10px] text-emerald-700">
                        Resolved at: {new Date(selectedIncident.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
              Select an emergency to inspect timeline and authority controls.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
