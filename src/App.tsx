import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Incident, UserRole, IncidentStatus } from './types';
import { Navbar } from './components/Navbar';
import { UserDashboard } from './components/UserDashboard';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AiInspectorModal } from './components/AiInspectorModal';
import { CollegeDocsModal } from './components/CollegeDocsModal';
import { AuthModal } from './components/AuthModal';
import { Bell, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

const PRESET_USERS: Record<UserRole, User> = {
  CITIZEN: {
    id: 'NAG-CIT-101',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@sankalpnagpur.org',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1435,
    currentLng: 79.0620,
    nagpurArea: 'Dharampeth, West Nagpur'
  },
  VOLUNTEER: {
    id: 'NAG-VOL-201',
    name: 'Rahul Verma',
    email: 'rahul.verma@sankalpnagpur.org',
    phone: '+91 91234 56789',
    role: 'VOLUNTEER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1458,
    currentLng: 79.0882,
    nagpurArea: 'Sitabuldi Central Station, Nagpur',
    skills: ['First Aid Certified', 'CPR Trained', 'Two-Wheeler Quick Response'],
    vehicle: 'Two-Wheeler (Motorcycle)'
  },
  ADMIN: {
    id: 'admin24',
    name: 'DCP Rajesh Rao',
    email: 'commissioner@nagpurpolice.gov.in',
    phone: '+91 71225 61234',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1510,
    currentLng: 79.0815,
    nagpurArea: 'Civil Lines, Police Headquarters Nagpur'
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(PRESET_USERS.CITIZEN);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCollegeDocsOpen, setIsCollegeDocsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'info' | 'success' | 'alert' } | null>(null);

  const prevIncidentCountRef = useRef<number>(0);

  // Requirement: "after opening our website ask to make id like volunteer id and user id and for admin make it default admin24/pass24"
  useEffect(() => {
    const saved = localStorage.getItem('sankalp_nagpur_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) {
          setCurrentUser(parsed);
          return;
        }
      } catch (e) {
        console.warn('Error reading saved session:', e);
      }
    }
    // Automatically trigger the Auth modal on website opening
    setIsAuthModalOpen(true);
  }, []);

  // Fetch Incidents from REST API
  const fetchIncidents = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/incidents');
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (data.incidents) {
        // Detect new incident arrival for real-time notification
        if (prevIncidentCountRef.current > 0 && data.incidents.length > prevIncidentCountRef.current) {
          const newest = data.incidents[0];
          setToastMessage({
            title: `New Nagpur Emergency: ${newest.id}`,
            desc: `${newest.title} (${newest.category} - ${newest.priority} PRIORITY)`,
            type: 'alert'
          });
        }
        prevIncidentCountRef.current = data.incidents.length;
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.warn('Could not fetch incidents from backend:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial load + Real-time automatic polling every 3.5 seconds
  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(() => {
      fetchIncidents(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Successful Login or ID generation from AuthModal
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sankalp_nagpur_auth_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
    setToastMessage({
      title: `Nagpur ID Activated: ${user.name}`,
      desc: `Logged in as ${user.role} (${user.id}). ${
        user.role === 'CITIZEN'
          ? 'You can now report emergency incidents and request on-ground help.'
          : user.role === 'VOLUNTEER'
          ? 'You can now accept emergency dispatches across Nagpur with "I CAN HELP".'
          : 'Nagpur District Command Room authenticated with admin24 credentials.'
      }`,
      type: 'success'
    });
  };

  // Switch role handler
  const handleSwitchUser = (role: UserRole) => {
    const user = PRESET_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('sankalp_nagpur_auth_user', JSON.stringify(user));
    setToastMessage({
      title: `Switched to ${role}`,
      desc: `Active Nagpur profile: ${user.name} (ID: ${user.id})`,
      type: 'info'
    });
  };

  // STEP 1: Citizen reports emergency
  const handleReportIncident = async (payload: any): Promise<Incident> => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to submit emergency report');
    }

    const data = await res.json();
    await fetchIncidents(true);

    setToastMessage({
      title: `Emergency Registered in Nagpur: ${data.incident.id}`,
      desc: `AI classified as ${data.incident.category} (${data.incident.priority} PRIORITY). Broadcasted to Nagpur volunteers & NMC police authority.`,
      type: 'success'
    });

    return data.incident;
  };

  // STEP 5: Volunteer clicks "I CAN HELP"
  const handleAssignVolunteer = async (incidentId: string) => {
    const res = await fetch(`/api/incidents/${incidentId}/volunteer-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        volunteerId: currentUser.id,
        volunteerName: currentUser.name,
        volunteerPhone: currentUser.phone,
        latitude: currentUser.currentLat || 21.1458,
        longitude: currentUser.currentLng || 79.0882
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign volunteer');
    }

    await fetchIncidents(true);
    setToastMessage({
      title: `Assigned to Emergency Mission`,
      desc: `You accepted ${incidentId}. Navigation route and incident location loaded on OpenStreetMap for Nagpur City.`,
      type: 'success'
    });
  };

  // STEP 7: Volunteer updates response status (ON_THE_WAY, HELP_STARTED, HELP_COMPLETED)
  const handleUpdateStatus = async (incidentId: string, status: IncidentStatus, notes?: string) => {
    const res = await fetch(`/api/incidents/${incidentId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        notes
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update status');
    }

    await fetchIncidents(true);
    setToastMessage({
      title: `Status Updated`,
      desc: `Incident ${incidentId} status set to ${status.replace(/_/g, ' ')}.`,
      type: 'info'
    });
  };

  // STEP 9: Admin or Authority marks incident as RESOLVED
  const handleResolveIncident = async (incidentId: string, notes?: string) => {
    const res = await fetch(`/api/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorName: currentUser.name,
        actorRole: currentUser.role,
        message: notes || 'Emergency response completed and verified by Nagpur emergency authorities.'
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to resolve emergency');
    }

    await fetchIncidents(true);
    setToastMessage({
      title: `Emergency RESOLVED`,
      desc: `Incident ${incidentId} marked as RESOLVED and archived by Nagpur District Command.`,
      type: 'success'
    });
  };

  // Instant 1-Tap SOS
  const handleFastSos = async () => {
    try {
      await handleReportIncident({
        title: 'SOS Urgent Distress Alert - Nagpur',
        description: 'Critical emergency SOS alert triggered. Immediate assistance required at reported Nagpur coordinates.',
        category: 'Medical Emergency',
        priority: 'CRITICAL',
        latitude: currentUser.currentLat || 21.1458,
        longitude: currentUser.currentLng || 79.0882,
        address: `${currentUser.nagpurArea || 'Zero Mile Central'}, Nagpur, Maharashtra`,
        affectedPeople: 1,
        reportedBy: {
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone
        }
      });
    } catch (err: any) {
      alert(`SOS Alert error: ${err.message}`);
    }
  };

  // Reset Demo Dataset
  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo incidents to initial clean Nagpur college viva state?')) return;
    try {
      const res = await fetch('/api/incidents/reset-demo', { method: 'POST' });
      const data = await res.json();
      setIncidents(data.incidents);
      setToastMessage({
        title: 'Nagpur Dataset Reset',
        desc: 'Incidents restored to standard viva examination scenarios in Nagpur City.',
        type: 'info'
      });
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAiInspector={() => setIsAiModalOpen(true)}
        onOpenCollegeDocs={() => setIsCollegeDocsOpen(true)}
        onFastSos={handleFastSos}
        onResetDemo={handleResetDemo}
      />

      {/* Live Toast Notification */}
      {toastMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between shadow-md border animate-in fade-in slide-in-from-top-2 duration-300 ${
              toastMessage.type === 'alert'
                ? 'bg-red-50 border-red-200 text-red-900'
                : toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {toastMessage.type === 'alert' ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              ) : toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Radio className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
              )}
              <div>
                <strong className="text-xs font-bold block">{toastMessage.title}</strong>
                <p className="text-xs opacity-90">{toastMessage.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-black/5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Dynamic View Based on Selected Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'CITIZEN' && (
          <UserDashboard
            currentUser={currentUser}
            incidents={incidents}
            onReportIncident={handleReportIncident}
            onRefresh={() => fetchIncidents()}
            isLoading={isLoading}
          />
        )}

        {currentUser.role === 'VOLUNTEER' && (
          <VolunteerDashboard
            currentUser={currentUser}
            incidents={incidents}
            onAssignVolunteer={handleAssignVolunteer}
            onUpdateStatus={handleUpdateStatus}
            onRefresh={() => fetchIncidents()}
            isLoading={isLoading}
          />
        )}

        {currentUser.role === 'ADMIN' && (
          <AdminDashboard
            currentUser={currentUser}
            incidents={incidents}
            onResolveIncident={handleResolveIncident}
            onRefresh={() => fetchIncidents()}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Auth ID Modal: Asks user to make ID (Citizen / Volunteer / Admin default admin24/pass24) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Modals */}
      <AiInspectorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      <CollegeDocsModal isOpen={isCollegeDocsOpen} onClose={() => setIsCollegeDocsOpen(false)} />

    </div>
  );
}
