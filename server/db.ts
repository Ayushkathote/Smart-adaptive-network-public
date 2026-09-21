import fs from 'fs';
import path from 'path';
import { Incident, User, ActivityTimelineItem, VolunteerAssignment } from '../src/types.ts';
import { globalClassifier } from './ml_classifier.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sankalp_db.json');

// Predefined Demo Users for Nagpur City, Maharashtra
export const DEFAULT_USERS: User[] = [
  {
    id: 'NAG-CIT-101',
    name: 'Ananya Sharma',
    email: 'ananya@nagpur.sankalp.gov.in',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1436,
    currentLng: 79.0632,
    nagpurArea: 'Dharampeth, West Nagpur'
  },
  {
    id: 'NAG-VOL-201',
    name: 'Rahul Verma',
    email: 'rahul.vol@nagpur.sankalp.gov.in',
    phone: '+91 91234 56789',
    role: 'VOLUNTEER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1458,
    currentLng: 79.0882,
    nagpurArea: 'Sitabuldi Central (Zero Mile)',
    skills: ['First Aid Certified', 'CPR Trained', 'Two-Wheeler Quick Response'],
    vehicle: 'Honda Activa 6G (First Aid Kit Equipped)'
  },
  {
    id: 'NAG-VOL-202',
    name: 'Priya Patel',
    email: 'priya.vol@nagpur.sankalp.gov.in',
    phone: '+91 93456 78901',
    role: 'VOLUNTEER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1340,
    currentLng: 79.0980,
    nagpurArea: 'Medical Square (GMCH Nagpur)',
    skills: ['Nursing Graduate', 'Emergency Triage', 'AED Operator'],
    vehicle: 'Four-Wheeler Emergency First Responder'
  },
  {
    id: 'NAG-ADM-301',
    name: 'DCP Rajesh Rao (NMC Command)',
    email: 'admin@nagpur.sankalp.gov.in',
    phone: '+91 99999 88888',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    currentLat: 21.1610,
    currentLng: 79.0730,
    nagpurArea: 'Civil Lines, Nagpur Police Commissionerate'
  }
];

export function getInitialIncidents(): Incident[] {
  const now = new Date();
  const tMinus = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

  const initialAi = globalClassifier.predict(
    "Two people are injured in a two-wheeler collision near Metro pillar. One person appears unconscious and immediate ambulance assistance is needed.",
    2
  );

  return [
    {
      id: 'INC-2026-0001',
      title: 'Road Accident Near Chhatrapati Square, Wardha Road',
      description: 'Two people are injured in a two-wheeler collision near Metro pillar. One person appears unconscious and immediate ambulance assistance is needed.',
      category: 'Road Accident',
      priority: 'HIGH',
      status: 'SUBMITTED',
      latitude: 21.1090,
      longitude: 79.0680,
      address: 'Near Chhatrapati Square Flyover, Wardha Road, South Nagpur, Maharashtra',
      affectedPeople: 2,
      reportedBy: {
        userId: 'NAG-CIT-101',
        userName: 'Ananya Sharma',
        userPhone: '+91 98765 43210'
      },
      aiAnalysis: initialAi,
      createdAt: tMinus(15),
      updatedAt: tMinus(15),
      timeline: [
        {
          id: 'act-101',
          incidentId: 'INC-2026-0001',
          timestamp: tMinus(15),
          title: 'Emergency Reported in Nagpur',
          description: 'Citizen Ananya Sharma registered emergency with Nagpur GPS coordinates & 2 casualties.',
          actorName: 'Ananya Sharma',
          actorRole: 'CITIZEN',
          statusAfter: 'SUBMITTED'
        },
        {
          id: 'act-102',
          incidentId: 'INC-2026-0001',
          timestamp: tMinus(14),
          title: 'AI Classification & Triage Complete',
          description: 'TF-IDF + Naive Bayes classified category as "Road Accident" with 98% confidence. Severity set to HIGH.',
          actorName: 'SANKALP AI Engine',
          actorRole: 'AI_ENGINE',
          statusAfter: 'SUBMITTED'
        }
      ]
    },
    {
      id: 'INC-2026-0002',
      title: 'Commercial Godown Fire at Gandhibagh, Itwari',
      description: 'LPG cylinder blast in cloth market storage warehouse. Thick black smoke spreading towards congested residential lanes.',
      category: 'Fire',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      latitude: 21.1520,
      longitude: 79.1150,
      address: 'Cloth Market Lane 4, Gandhibagh, Itwari, East Nagpur, Maharashtra',
      affectedPeople: 4,
      reportedBy: {
        userId: 'NAG-CIT-101',
        userName: 'Ananya Sharma',
        userPhone: '+91 98765 43210'
      },
      assignedVolunteer: {
        id: 'asgn-201',
        incidentId: 'INC-2026-0002',
        volunteerId: 'NAG-VOL-202',
        volunteerName: 'Priya Patel',
        volunteerPhone: '+91 93456 78901',
        assignedAt: tMinus(25),
        currentStatus: 'ASSIGNED',
        volunteerLat: 21.1340,
        volunteerLng: 79.0980
      },
      aiAnalysis: globalClassifier.predict(
        'LPG cylinder blast in cloth market storage warehouse. Thick black smoke spreading towards congested residential lanes.',
        4
      ),
      createdAt: tMinus(30),
      updatedAt: tMinus(25),
      timeline: [
        {
          id: 'act-201',
          incidentId: 'INC-2026-0002',
          timestamp: tMinus(30),
          title: 'Emergency Reported',
          description: 'Emergency reported by citizen near Itwari Gandhibagh market area.',
          actorName: 'Ananya Sharma',
          actorRole: 'CITIZEN',
          statusAfter: 'SUBMITTED'
        },
        {
          id: 'act-202',
          incidentId: 'INC-2026-0002',
          timestamp: tMinus(29),
          title: 'AI Classification Complete',
          description: 'Classified as Fire with CRITICAL priority due to LPG cylinder blast and 4 people affected.',
          actorName: 'SANKALP AI Engine',
          actorRole: 'AI_ENGINE',
          statusAfter: 'SUBMITTED'
        },
        {
          id: 'act-203',
          incidentId: 'INC-2026-0002',
          timestamp: tMinus(25),
          title: 'Volunteer Accepted ("I CAN HELP")',
          description: 'Volunteer Priya Patel from Medical Square station accepted assignment. Navigation route to Itwari generated.',
          actorName: 'Priya Patel',
          actorRole: 'VOLUNTEER',
          statusAfter: 'ASSIGNED'
        }
      ]
    },
    {
      id: 'INC-2026-0003',
      title: 'Cardiac Arrest at Sitabuldi Metro Station Platform',
      description: 'Commuter collapsed suddenly near ticket gate at Zero Mile Metro interchange. Pulse weak, CPR administered.',
      category: 'Medical Emergency',
      priority: 'CRITICAL',
      status: 'RESOLVED',
      latitude: 21.1458,
      longitude: 79.0882,
      address: 'Platform 1 Concourse, Sitabuldi Metro Interchange, Zero Mile, Nagpur',
      affectedPeople: 1,
      reportedBy: {
        userId: 'NAG-CIT-101',
        userName: 'Ananya Sharma',
        userPhone: '+91 98765 43210'
      },
      assignedVolunteer: {
        id: 'asgn-301',
        incidentId: 'INC-2026-0003',
        volunteerId: 'NAG-VOL-201',
        volunteerName: 'Rahul Verma',
        volunteerPhone: '+91 91234 56789',
        assignedAt: tMinus(75),
        currentStatus: 'RESOLVED',
        volunteerLat: 21.1458,
        volunteerLng: 79.0882
      },
      aiAnalysis: globalClassifier.predict(
        'Commuter collapsed suddenly near ticket gate at Zero Mile Metro interchange. Pulse weak, CPR administered.',
        1
      ),
      createdAt: tMinus(90),
      updatedAt: tMinus(20),
      resolvedAt: tMinus(20),
      resolutionMessage: 'GMCH Nagpur 108 Emergency ambulance reached location. Patient stabilized with portable AED defibrillator and admitted to Cardiology ICU.',
      timeline: [
        {
          id: 'act-301',
          incidentId: 'INC-2026-0003',
          timestamp: tMinus(90),
          title: 'Medical Emergency Reported',
          description: 'Alert generated from Sitabuldi Metro Station.',
          actorName: 'Ananya Sharma',
          actorRole: 'CITIZEN',
          statusAfter: 'SUBMITTED'
        },
        {
          id: 'act-302',
          incidentId: 'INC-2026-0003',
          timestamp: tMinus(75),
          title: 'Volunteer Rahul Verma Responded',
          description: 'Stationed at Zero Mile, reached platform within 3 minutes with emergency CPR pack.',
          actorName: 'Rahul Verma',
          actorRole: 'VOLUNTEER',
          statusAfter: 'ASSIGNED'
        },
        {
          id: 'act-303',
          incidentId: 'INC-2026-0003',
          timestamp: tMinus(70),
          title: 'Volunteer ON THE WAY',
          description: 'Navigating to Sitabuldi Concourse Platform 1.',
          actorName: 'Rahul Verma',
          actorRole: 'VOLUNTEER',
          statusAfter: 'ON_THE_WAY'
        },
        {
          id: 'act-304',
          incidentId: 'INC-2026-0003',
          timestamp: tMinus(50),
          title: 'HELP STARTED on Site',
          description: 'Volunteer arrived and performed external chest compressions until GMCH paramedics arrived.',
          actorName: 'Rahul Verma',
          actorRole: 'VOLUNTEER',
          statusAfter: 'HELP_STARTED'
        },
        {
          id: 'act-305',
          incidentId: 'INC-2026-0003',
          timestamp: tMinus(30),
          title: 'HELP COMPLETED',
          description: 'Patient vitals handed over safely to Dr. Kulkarni (GMCH Ambulance).',
          actorName: 'Rahul Verma',
          actorRole: 'VOLUNTEER',
          statusAfter: 'HELP_COMPLETED'
        },
        {
          id: 'act-306',
          incidentId: 'INC-2026-0003',
          timestamp: tMinus(20),
          title: 'Emergency RESOLVED by NMC Authority',
          description: 'Verified resolution. Commuter safely in GMCH Nagpur Trauma Care.',
          actorName: 'DCP Rajesh Rao',
          actorRole: 'ADMIN',
          statusAfter: 'RESOLVED'
        }
      ]
    }
  ];
}

class SankalpDatabase {
  private users: User[] = [...DEFAULT_USERS];
  private incidents: Incident[] = [];
  private incidentCounter = 4;

  constructor() {
    this.loadFromDisk();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.error('Failed to create data dir', e);
      }
    }
  }

  private saveToDisk() {
    try {
      this.ensureDir();
      const payload = {
        users: this.users,
        incidents: this.incidents,
        incidentCounter: this.incidentCounter
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Database write error', e);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        // Check if database has outdated coordinates instead of Nagpur (21.1458, 79.0882)
        const isNagpurConfigured = data.users?.some((u: any) => u.id?.startsWith('NAG-') || (u.currentLat && u.currentLat < 23));
        if (!isNagpurConfigured) {
          console.log('Upgrading database to Nagpur City, Maharashtra schema & coordinates...');
          this.resetDemo();
          return;
        }
        this.users = data.users || [...DEFAULT_USERS];
        this.incidents = data.incidents || getInitialIncidents();
        this.incidentCounter = data.incidentCounter || 4;
        return;
      }
    } catch (e) {
      console.warn('Could not read existing database file, seeding defaults', e);
    }
    this.resetDemo();
  }

  public resetDemo() {
    this.users = [...DEFAULT_USERS];
    this.incidents = getInitialIncidents();
    this.incidentCounter = 4;
    this.saveToDisk();
  }

  // User methods
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id.toLowerCase() === id.toLowerCase());
  }

  public getUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/\D/g, '');
    return this.users.find(u => u.phone.replace(/\D/g, '') === clean);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public registerUser(data: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    role: User['role'];
    nagpurArea?: string;
    skills?: string[];
    vehicle?: string;
    currentLat?: number;
    currentLng?: number;
  }): User {
    let finalId = data.id?.trim();
    if (!finalId) {
      const prefix = data.role === 'VOLUNTEER' ? 'NAG-VOL' : data.role === 'ADMIN' ? 'NAG-ADM' : 'NAG-CIT';
      const randNum = Math.floor(100 + Math.random() * 900);
      finalId = `${prefix}-${randNum}`;
    }

    const existing = this.users.find(
      u => u.id.toLowerCase() === finalId!.toLowerCase() || (data.phone && u.phone === data.phone && u.role === data.role)
    );

    if (existing) {
      existing.name = data.name || existing.name;
      existing.role = data.role || existing.role;
      existing.phone = data.phone || existing.phone;
      if (data.nagpurArea) existing.nagpurArea = data.nagpurArea;
      if (data.skills) existing.skills = data.skills;
      if (data.vehicle) existing.vehicle = data.vehicle;
      if (data.currentLat) existing.currentLat = data.currentLat;
      if (data.currentLng) existing.currentLng = data.currentLng;
      this.saveToDisk();
      return existing;
    }

    const newUser: User = {
      id: finalId,
      name: data.name,
      email: data.email || `${finalId.toLowerCase()}@nagpur.sankalp.gov.in`,
      phone: data.phone,
      role: data.role,
      avatar: data.role === 'VOLUNTEER'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        : data.role === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      currentLat: data.currentLat || 21.1458,
      currentLng: data.currentLng || 79.0882,
      nagpurArea: data.nagpurArea || 'Sitabuldi (Zero Mile), Nagpur',
      skills: data.skills,
      vehicle: data.vehicle
    };

    this.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  public validateAdmin(username?: string, password?: string): { success: boolean; user?: User; error?: string } {
    if (username?.trim() === 'admin24' && password?.trim() === 'pass24') {
      let admin = this.users.find(u => u.role === 'ADMIN');
      if (!admin) {
        admin = DEFAULT_USERS.find(u => u.role === 'ADMIN')!;
        this.users.push(admin);
        this.saveToDisk();
      }
      return { success: true, user: admin };
    }
    return {
      success: false,
      error: 'Invalid credentials! For Admin console, use default Username: admin24 and Password: pass24'
    };
  }

  public createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `NAG-CIT-${Math.floor(100 + Math.random() * 900)}`
    };
    this.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  // Incident methods
  public getIncidents(): Incident[] {
    return [...this.incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(inc => inc.id === id);
  }

  public createIncident(data: {
    title: string;
    description: string;
    category?: Incident['category'];
    priority?: Incident['priority'];
    latitude: number;
    longitude: number;
    address?: string;
    affectedPeople: number;
    evidenceImage?: string;
    reportedBy: {
      userId: string;
      userName: string;
      userPhone: string;
    };
  }): Incident {
    // Run AI NLP Pipeline on description
    const aiResult = globalClassifier.predict(data.description, data.affectedPeople);

    const padNum = String(this.incidentCounter).padStart(4, '0');
    const id = `INC-2026-${padNum}`;
    this.incidentCounter++;

    const now = new Date().toISOString();
    const finalCategory = data.category || aiResult.category;
    const finalPriority = data.priority || aiResult.priority;

    const newIncident: Incident = {
      id,
      title: data.title,
      description: data.description,
      category: finalCategory,
      priority: finalPriority,
      status: 'SUBMITTED',
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      address: data.address || `GPS Coordinates: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
      affectedPeople: Number(data.affectedPeople) || 1,
      evidenceImage: data.evidenceImage,
      reportedBy: data.reportedBy,
      aiAnalysis: aiResult,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `act-${Date.now()}-1`,
          incidentId: id,
          timestamp: now,
          title: 'Emergency Reported',
          description: `Emergency reported by ${data.reportedBy.userName}. Incident registered in database.`,
          actorName: data.reportedBy.userName,
          actorRole: 'CITIZEN',
          statusAfter: 'SUBMITTED'
        },
        {
          id: `act-${Date.now()}-2`,
          incidentId: id,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          title: 'AI Classification & Triage Complete',
          description: `NLP Classifier detected category "${aiResult.category}" with ${aiResult.confidence}% confidence. Priority calculated as ${finalPriority}.`,
          actorName: 'SANKALP AI Engine',
          actorRole: 'AI_ENGINE',
          statusAfter: 'SUBMITTED'
        }
      ]
    };

    this.incidents.unshift(newIncident);
    this.saveToDisk();
    return newIncident;
  }

  // STEP 5: Volunteer Clicks "I CAN HELP"
  public assignVolunteer(
    incidentId: string,
    volunteer: {
      id: string;
      name: string;
      phone: string;
      latitude?: number;
      longitude?: number;
    }
  ): Incident {
    const incident = this.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const now = new Date().toISOString();
    const assignment: VolunteerAssignment = {
      id: `asgn-${Date.now()}`,
      incidentId: incident.id,
      volunteerId: volunteer.id,
      volunteerName: volunteer.name,
      volunteerPhone: volunteer.phone,
      assignedAt: now,
      currentStatus: 'ASSIGNED',
      volunteerLat: volunteer.latitude || 28.6210,
      volunteerLng: volunteer.longitude || 77.2180
    };

    incident.assignedVolunteer = assignment;
    incident.status = 'ASSIGNED';
    incident.updatedAt = now;

    // Timeline record
    incident.timeline.push({
      id: `act-${Date.now()}`,
      incidentId: incident.id,
      timestamp: now,
      title: 'Volunteer Accepted ("I CAN HELP")',
      description: `Volunteer ${volunteer.name} accepted responsibility. Assignment record created and route initialized.`,
      actorName: volunteer.name,
      actorRole: 'VOLUNTEER',
      statusAfter: 'ASSIGNED'
    });

    this.saveToDisk();
    return incident;
  }

  // STEP 7: Volunteer Response Status progression: ON_THE_WAY, HELP_STARTED, HELP_COMPLETED
  public updateIncidentStatus(
    incidentId: string,
    status: Incident['status'],
    actor: { name: string; role: User['role']; notes?: string }
  ): Incident {
    const incident = this.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const now = new Date().toISOString();
    incident.status = status;
    incident.updatedAt = now;

    if (incident.assignedVolunteer) {
      incident.assignedVolunteer.currentStatus = status;
    }

    let title = `Status Updated to ${status.replace(/_/g, ' ')}`;
    let description = actor.notes || `Status changed to ${status.replace(/_/g, ' ')} by ${actor.name}.`;

    if (status === 'ON_THE_WAY') {
      title = 'Volunteer ON THE WAY';
      description = actor.notes || `Volunteer ${actor.name} is en route to emergency coordinates.`;
    } else if (status === 'HELP_STARTED') {
      title = 'HELP STARTED on Site';
      description = actor.notes || `Volunteer ${actor.name} has arrived at the location and commenced on-site assistance.`;
    } else if (status === 'HELP_COMPLETED') {
      title = 'Volunteer Marked HELP COMPLETED';
      description = actor.notes || `Volunteer ${actor.name} finished emergency assistance. Pending final authority review.`;
    } else if (status === 'RESOLVED') {
      title = 'Emergency Marked as RESOLVED';
      description = actor.notes || `Emergency verified and closed by authority ${actor.name}.`;
      incident.resolvedAt = now;
      incident.resolutionMessage = actor.notes || 'Emergency response successfully completed and verified.';
    }

    incident.timeline.push({
      id: `act-${Date.now()}`,
      incidentId: incident.id,
      timestamp: now,
      title,
      description,
      actorName: actor.name,
      actorRole: actor.role,
      statusAfter: status
    });

    this.saveToDisk();
    return incident;
  }

  // STEP 9: Resolving Emergency by Admin or Volunteer
  public resolveIncident(
    incidentId: string,
    actor: { name: string; role: User['role']; message: string }
  ): Incident {
    const incident = this.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const now = new Date().toISOString();
    incident.status = 'RESOLVED';
    incident.updatedAt = now;
    incident.resolvedAt = now;
    incident.resolutionMessage = actor.message || 'Emergency response completed and verified by emergency authorities.';

    if (incident.assignedVolunteer) {
      incident.assignedVolunteer.currentStatus = 'RESOLVED';
    }

    incident.timeline.push({
      id: `act-${Date.now()}`,
      incidentId: incident.id,
      timestamp: now,
      title: 'Emergency RESOLVED',
      description: incident.resolutionMessage,
      actorName: actor.name,
      actorRole: actor.role,
      statusAfter: 'RESOLVED'
    });

    this.saveToDisk();
    return incident;
  }
}

export const db = new SankalpDatabase();
