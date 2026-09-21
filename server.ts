import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, DEFAULT_USERS } from './server/db.ts';
import { globalClassifier } from './server/ml_classifier.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'SANKALP - Smart Adaptive Network for Community Assistance & Public Safety',
    academicYear: '2026-2027',
    timestamp: new Date().toISOString()
  });
});

// Download VS Code Setup Guide for Laptop
app.get('/api/download-vscode-guide', (req, res) => {
  const guidePath = path.join(process.cwd(), 'HOW_TO_RUN_IN_VS_CODE.md');
  res.download(guidePath, 'HOW_TO_RUN_IN_VS_CODE.md');
});

// AUTH & USERS
app.get('/api/auth/users', (req, res) => {
  res.json({ users: db.getUsers() });
});

// Register or Create Citizen ID / Volunteer ID for Nagpur City
app.post('/api/auth/register-id', (req, res) => {
  try {
    const { name, phone, email, role, nagpurArea, skills, vehicle, customId, currentLat, currentLng } = req.body;
    if (!name || !phone || !role) {
      return res.status(400).json({ error: 'Name, phone number, and role are required' });
    }

    const user = db.registerUser({
      id: customId,
      name,
      phone,
      email,
      role,
      nagpurArea,
      skills,
      vehicle,
      currentLat,
      currentLng
    });

    res.status(201).json({
      message: `${role} ID generated successfully for Nagpur City`,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register ID' });
  }
});

// Login with Existing ID or Phone
app.post('/api/auth/login-id', (req, res) => {
  try {
    const { id, phone } = req.body;
    if (!id && !phone) {
      return res.status(400).json({ error: 'Please provide either ID or registered phone number' });
    }

    let user;
    if (id) {
      user = db.getUserById(id.trim());
    }
    if (!user && phone) {
      user = db.getUserByPhone(phone.trim());
    }

    if (!user) {
      return res.status(404).json({
        error: `User not found for ID/Phone "${id || phone}". Please register to create your Nagpur ID.`
      });
    }

    res.json({ message: 'Login successful', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Admin Authority Login with admin24 / pass24 default credentials
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  const result = db.validateAdmin(username, password);
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }
  res.json({
    message: 'Welcome DCP Rajesh Rao. Nagpur Emergency Command Center Authenticated.',
    user: result.user
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, role, name, phone } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    user = db.createUser({
      name: name || email.split('@')[0],
      email,
      phone: phone || '+91 98765 00000',
      role: role || 'CITIZEN'
    });
  }
  res.json({ user });
});

// INCIDENTS API
app.get('/api/incidents', (req, res) => {
  const incidents = db.getIncidents();
  res.json({ incidents });
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json({ incident });
});

// STEP 1 & 3: Citizen Reports Emergency + Automatic AI Classification
app.post('/api/incidents', (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      latitude,
      longitude,
      address,
      affectedPeople,
      evidenceImage,
      reportedBy
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const incident = db.createIncident({
      title,
      description,
      category,
      priority,
      latitude: latitude ?? 21.1458,
      longitude: longitude ?? 79.0882,
      address: address || 'Sitabuldi Zero Mile, Nagpur, Maharashtra',
      affectedPeople: affectedPeople || 1,
      evidenceImage,
      reportedBy: reportedBy || {
        userId: 'NAG-CIT-101',
        userName: 'Ananya Sharma',
        userPhone: '+91 98765 43210'
      }
    });

    res.status(201).json({
      message: 'Emergency Report Submitted Successfully',
      incident
    });
  } catch (err: any) {
    console.error('Error creating incident:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// STEP 5: Volunteer Clicks "I CAN HELP"
app.post('/api/incidents/:id/volunteer-assign', (req, res) => {
  try {
    const { volunteerId, volunteerName, volunteerPhone, latitude, longitude } = req.body;
    if (!volunteerId || !volunteerName) {
      return res.status(400).json({ error: 'Volunteer ID and name are required' });
    }

    const updated = db.assignVolunteer(req.params.id, {
      id: volunteerId,
      name: volunteerName,
      phone: volunteerPhone || '+91 91234 56789',
      latitude: latitude || 21.1458,
      longitude: longitude || 79.0882
    });

    res.json({
      message: 'Volunteer successfully assigned to emergency',
      incident: updated
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// STEP 7: Volunteer Response Status: ON_THE_WAY, HELP_STARTED, HELP_COMPLETED
app.post('/api/incidents/:id/status', (req, res) => {
  try {
    const { status, actorName, actorRole, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = db.updateIncidentStatus(req.params.id, status, {
      name: actorName || 'Volunteer',
      role: actorRole || 'VOLUNTEER',
      notes
    });

    res.json({
      message: `Status updated to ${status}`,
      incident: updated
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// STEP 9: Resolve Incident (Admin or Volunteer)
app.post('/api/incidents/:id/resolve', (req, res) => {
  try {
    const { actorName, actorRole, message } = req.body;
    const updated = db.resolveIncident(req.params.id, {
      name: actorName || 'Authority Admin',
      role: actorRole || 'ADMIN',
      message: message || 'Emergency response completed and verified.'
    });

    res.json({
      message: 'Incident successfully resolved',
      incident: updated
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// RESET DEMO DATA
app.post('/api/incidents/reset-demo', (req, res) => {
  db.resetDemo();
  res.json({
    message: 'Demo dataset reset successfully',
    incidents: db.getIncidents()
  });
});

// AI NLP LAB ENDPOINT
app.post('/api/ai/classify', (req, res) => {
  const { text, affectedCount } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for classification' });
  }

  const prediction = globalClassifier.predict(text, Number(affectedCount) || 1);
  res.json({ prediction });
});

app.get('/api/ai/model-stats', (req, res) => {
  res.json(globalClassifier.getModelStats());
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`SANKALP Emergency Network Server running on port ${PORT}`);
    console.log(`AI/ML TF-IDF Classifier initialized & ready.`);
    console.log(`Academic Year: 2026-2027 Major Project`);
    console.log(`====================================================`);
  });
}

startServer();
