import React, { useState } from 'react';
import { Incident, User, IncidentStatus } from '../types';
import { LeafletMap } from './LeafletMap';
import {
  HandHeart,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Phone,
  Radio
} from 'lucide-react';

interface VolunteerDashboardProps {
  currentUser: User;
  incidents: Incident[];
  onAssignVolunteer: (incidentId: string) => Promise<void>;
  onUpdateStatus: (incidentId: string, status: IncidentStatus, notes?: string) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

// Haversine distance calculator
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${(d * 1000).toFixed(0)} meters` : `${d.toFixed(1)} km`;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  currentUser,
  incidents,
  onAssignVolunteer,
  onUpdateStatus,
  onRefresh,
  isLoading
}) => {
  const volunteerLat = currentUser.currentLat || 21.1458;
  const volunteerLng = currentUser.currentLng || 79.0882;

  // Find active assignments for this volunteer
  const myActiveAssignments = incidents.filter(
    inc =>
      inc.assignedVolunteer?.volunteerId === currentUser.id &&
      inc.status !== 'RESOLVED'
  );

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    myActiveAssignments.length > 0 ? myActiveAssignments[0].id : null
  );

  // Available Emergencies (status is SUBMITTED, awaiting volunteer)
  const availableEmergencies = incidents.filter(inc => inc.status === 'SUBMITTED');

  // Currently focused incident for map / details
  const activeIncident =
    incidents.find(i => i.id === selectedIncidentId) ||
    myActiveAssignments[0] ||
    availableEmergencies[0] ||
    null;

  const [isProcessing, setIsProcessing] = useState(false);

  // Click "I CAN HELP"
  const handleCanHelp = async (incidentId: string) => {
    setIsProcessing(true);
    try {
      await onAssignVolunteer(incidentId);
      setSelectedIncidentId(incidentId);
    } catch (err: any) {
      alert(`Could not accept emergency: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Status button actions
  const handleStatusChange = async (incidentId: string, nextStatus: IncidentStatus, notes?: string) => {
    setIsProcessing(true);
    try {
      await onUpdateStatus(incidentId, nextStatus, notes);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Volunteer Hero Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs mb-2">
              <HandHeart className="w-3.5 h-3.5 text-emerald-200" />
              Role 2: Verified Community Volunteer • Nagpur City
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Volunteer Emergency Dispatch Station</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
              Welcome, <strong>{currentUser.name}</strong>. Stationed at <strong>{currentUser.nagpurArea || 'Sitabuldi Central Station, Nagpur'}</strong>.
              Respond to verified alerts across Nagpur, navigate via real-time OpenStreetMap, and provide immediate on-ground aid.
            </p>
            {currentUser.skills && currentUser.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {currentUser.skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-medium text-emerald-100 border border-white/20">
                    ✓ {s}
                  </span>
                ))}
                {currentUser.vehicle && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 text-[11px] font-medium border border-amber-400/30">
                    🛵 {currentUser.vehicle}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-right">
              <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">Volunteer ID</span>
              <span className="font-mono text-sm font-bold text-white">{currentUser.id}</span>
            </div>
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors"
              title="Refresh emergencies"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE ASSIGNMENT BANNER (IF ANY) */}
      {myActiveAssignments.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  ACTIVE MISSION IN PROGRESS
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {myActiveAssignments[0].id}: {myActiveAssignments[0].title}
                </h3>
              </div>
            </div>

            {/* Current Stage Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Current Mission Status:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                {myActiveAssignments[0].status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* STEP 7 WORKFLOW ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <span>Caller: <strong>{myActiveAssignments[0].reportedBy.userName}</strong> ({myActiveAssignments[0].reportedBy.userPhone})</span>
              <span>&bull;</span>
              <span>Distance: <strong>{getDistanceKm(volunteerLat, volunteerLng, myActiveAssignments[0].latitude, myActiveAssignments[0].longitude)}</strong></span>
            </div>

            {/* Workflow progression buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {myActiveAssignments[0].status === 'ASSIGNED' && (
                <button
                  id="btn-status-on-the-way"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange(myActiveAssignments[0].id, 'ON_THE_WAY')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Navigation className="w-4 h-4" />
                  CLICK "ON THE WAY"
                </button>
              )}

              {myActiveAssignments[0].status === 'ON_THE_WAY' && (
                <button
                  id="btn-status-help-started"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange(myActiveAssignments[0].id, 'HELP_STARTED')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  CLICK "HELP STARTED" (Arrived on Site)
                </button>
              )}

              {myActiveAssignments[0].status === 'HELP_STARTED' && (
                <button
                  id="btn-status-help-completed"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange(myActiveAssignments[0].id, 'HELP_COMPLETED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  CLICK "HELP COMPLETED"
                </button>
              )}

              {myActiveAssignments[0].status === 'HELP_COMPLETED' && (
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Help Completed! Awaiting final Admin / Authority resolution.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT: AVAILABLE EMERGENCIES LIST + INTERACTIVE ROUTE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: AVAILABLE EMERGENCIES FEED */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Available Emergencies</h2>
              <p className="text-xs text-slate-500">Unassigned citizen reports requiring local assistance.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
              {availableEmergencies.length} Open
            </span>
          </div>

          {availableEmergencies.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">All Emergencies Assigned</h3>
              <p className="text-xs text-slate-500 mt-1">
                There are currently no unassigned emergency reports in your sector.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableEmergencies.map(inc => {
                const distanceStr = getDistanceKm(volunteerLat, volunteerLng, inc.latitude, inc.longitude);
                const isSelected = activeIncident?.id === inc.id;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all shadow-xs ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header: ID + Priority + Category */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
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
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {inc.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">{inc.title}</h3>
                      </div>

                      {/* Distance pill */}
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0">
                        🚗 ~{distanceStr}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{inc.description}</p>

                    {/* Metadata & Location */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {inc.address}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>&bull;</span>
                      <span>{inc.affectedPeople} affected</span>
                    </div>

                    {/* STEP 5: "I CAN HELP" BUTTON */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Status: <strong className="text-amber-700">SUBMITTED (Awaiting Help)</strong>
                      </span>

                      <button
                        id={`btn-i-can-help-${inc.id}`}
                        disabled={isProcessing}
                        onClick={e => {
                          e.stopPropagation();
                          handleCanHelp(inc.id);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <HandHeart className="w-4 h-4" />
                        I CAN HELP
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STEP 6 VOLUNTEER MAP WITH ROUTE & LOCATION */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Live Dispatch Navigation Map
                </h3>
                <p className="text-xs text-slate-500">Leaflet.js + OpenStreetMap dynamic routing view.</p>
              </div>

              {activeIncident && (
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {activeIncident.id}
                </span>
              )}
            </div>

            {/* LEAFLET MAP WITH VOLUNTEER AND EMERGENCY LOCATIONS */}
            <LeafletMap
              selectedIncident={activeIncident}
              volunteerLocation={{
                lat: volunteerLat,
                lng: volunteerLng,
                name: currentUser.name
              }}
              height="380px"
              zoom={14}
              showRoute={true}
            />

            {/* Selected Target Info Box */}
            {activeIncident ? (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">{activeIncident.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    {activeIncident.category}
                  </span>
                </div>
                <p className="text-slate-600">{activeIncident.address}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Volunteer Location:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {volunteerLat.toFixed(4)}° N, {volunteerLng.toFixed(4)}° E
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Incident Coordinates:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {activeIncident.latitude.toFixed(4)}° N, {activeIncident.longitude.toFixed(4)}° E
                    </span>
                  </div>
                </div>

                {/* Direct Google Maps / External Routing link if practical */}
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${volunteerLat},${volunteerLng}&destination=${activeIncident.latitude},${activeIncident.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Route in External Navigation App &rarr;
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                Select an emergency to inspect coordinates and routing vectors.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
