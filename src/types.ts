export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'ADMIN';

export type EmergencyCategory =
  | 'Road Accident'
  | 'Fire'
  | 'Medical Emergency'
  | 'Flood'
  | 'Earthquake'
  | 'Missing Person'
  | 'Crime/Safety'
  | 'Other';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus =
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'HELP_STARTED'
  | 'HELP_COMPLETED'
  | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  currentLat?: number;
  currentLng?: number;
  nagpurArea?: string;
  skills?: string[];
  vehicle?: string;
}

export interface ActivityTimelineItem {
  id: string;
  incidentId: string;
  timestamp: string; // ISO string
  title: string;
  description: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM' | 'AI_ENGINE';
  statusAfter?: IncidentStatus;
}

export interface VolunteerAssignment {
  id: string;
  incidentId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  assignedAt: string;
  currentStatus: IncidentStatus;
  volunteerLat: number;
  volunteerLng: number;
}

export interface AIAnalysisResult {
  category: EmergencyCategory;
  priority: PriorityLevel;
  confidence: number;
  keywords: string[];
  categoryProbabilities: Record<string, number>;
  explanation: string;
  model: string;
}

export interface Incident {
  id: string; // e.g. INC-2026-0001
  title: string;
  description: string;
  category: EmergencyCategory;
  priority: PriorityLevel;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  address: string;
  affectedPeople: number;
  evidenceImage?: string;
  reportedBy: {
    userId: string;
    userName: string;
    userPhone: string;
  };
  assignedVolunteer?: VolunteerAssignment;
  aiAnalysis: AIAnalysisResult;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionMessage?: string;
  timeline: ActivityTimelineItem[];
}
