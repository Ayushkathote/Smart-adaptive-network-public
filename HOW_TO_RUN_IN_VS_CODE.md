# SANKALP — HOW TO RUN THIS PROJECT IN VS CODE ON YOUR LAPTOP

**Project Title:** SANKALP — AI-Based Smart Adaptive Network for Community Assistance & Public Safety (Nagpur Emergency Response Network)  
**Academic Year:** 2026–2027  
**Degree:** Bachelor of Technology (B.Tech) in Computer Science & Engineering  
**Operating System:** Windows 10 / 11, macOS, or Linux  

---

## 📥 STEP 0: How to Download the Project Files to Your Laptop

1. Look at the top-right corner of the **Google AI Studio** window.
2. Click the **Export / Settings** menu (the three dots `...` or Settings cog icon).
3. Click **"Download ZIP"** or **"Export to GitHub"**.
4. Once downloaded, **right-click the `.zip` file** and select **"Extract All..."**.
5. Choose a clean destination folder on your laptop, for example:
   - Windows: `C:\Projects\SANKALP` or `C:\Users\YourName\Desktop\SANKALP`
   - Mac/Linux: `~/Projects/SANKALP`

---

## 🛠️ STEP 1: Install Required Tools on Your Laptop

Before opening the project, ensure you have these two free tools installed:

### 1. Visual Studio Code (VS Code)
- Download and install from: **https://code.visualstudio.com/**

### 2. Node.js (LTS Version 20.x or 22.x)
- Download and install from: **https://nodejs.org/** (choose the **LTS** version).
- During Windows installation, leave all default checkboxes checked.
- **Verify installation:**
  - Press `Win + R`, type `cmd` and press Enter.
  - Type:
    ```bash
    node -v
    npm -v
    ```
  - Both should show version numbers (e.g. `v20.x.x` or `v22.x.x` and `npm 10.x.x`).

### 3. (Optional) Python 3.10+ (for training ML model locally)
- Download from: **https://www.python.org/**
- ⚠️ **Important on Windows:** During installation, check the box **"Add Python to PATH"**.

---

## 💻 STEP 2: Open the Project in VS Code

1. Launch **Visual Studio Code**.
2. Click **File** ➔ **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select the extracted `SANKALP` project directory (the folder containing `package.json`).
4. Click **Select Folder**. If asked *"Do you trust the authors of the files in this folder?"*, click **Yes, I trust the authors**.

---

## ⚡ STEP 3: Open Terminal & Run Project Commands

Inside VS Code, open the integrated terminal:
- Press **`Ctrl + \``** (Ctrl + Backtick, the key above Tab)  
  *OR* click top menu: **Terminal ➔ New Terminal**.

### Command 1: Install Project Dependencies
In the VS Code terminal, run:
```bash
npm install
```
*(This installs React 19, Express backend, Vite, Tailwind CSS, Leaflet OpenStreetMap, and Lucide icons. Takes about 30–60 seconds.)*

---

### Command 2: Start the Development Server
In the same terminal, run:
```bash
npm run dev
```

---

## 🌐 STEP 4: Open in Your Browser

Once `npm run dev` finishes starting, your terminal will show:
```
Server running on http://localhost:3000
```

1. Open **Google Chrome**, **Microsoft Edge**, or **Firefox**.
2. Navigate to:
   👉 **`http://localhost:3000`**

The full application will load with real-time incident tracking, Leaflet maps, and instant AI triage!

---

## 🔑 STEP 5: Login & Default Credentials for Viva Demo

When you first open the website at `http://localhost:3000`, the **Identity Activation Modal** appears:

### 1. Admin / District Command Center (Default Credentials):
- **Role:** Administrator (Nagpur District Police & Municipal Authority)
- **Admin ID:** `admin24`
- **Password:** `pass24`
- *Access:* Grants full operational command at Zero Mile, verifies on-ground dispatches, and signs off on incident resolutions.

### 2. Citizen / User Persona:
- **Default ID:** `NAG-CIT-101` (Ananya Sharma — Dharampeth, West Nagpur)
- Or click **"Generate New Citizen ID"** to create a custom ID with your own name.
- *Access:* Report emergencies, activate instant 1-tap SOS, view real-time volunteer updates.

### 3. Volunteer Responder Persona:
- **Default ID:** `NAG-VOL-201` (Rahul Verma — Sitabuldi Central Station)
- Or click **"Make Volunteer ID"** to register your vehicle and medical certifications.
- *Access:* Accept pending alerts with **"I CAN HELP"**, open turn-by-turn map coordinates, update stages (`ON THE WAY`, `HELP STARTED`, `HELP COMPLETED`).

---

## 🎓 STEP 6: Examiner Viva Demonstration Script (3-Minute Flow)

Follow these exact steps when presenting your project in college:

1. **Step 1 (Citizen Report):**
   - In the top bar or switcher, select **Citizen** (`NAG-CIT-101`).
   - Click **"Report Emergency"**.
   - Enter:
     - **Title:** `Road Collision on Wardha Road Near Chhatrapati Square`
     - **Description:** `Two two-wheelers collided. Rider is bleeding from knee and unable to move. Immediate first aid required.`
   - Click **"SUBMIT EMERGENCY REPORT"**.
   - Show the panel: The AI NLP engine categorizes it as **Road Accident** (Priority: **HIGH**) instantly.

2. **Step 2 (Volunteer Dispatch):**
   - Click **Switch ID** ➔ Select **Volunteer** (`NAG-VOL-201`, Rahul Verma).
   - Under *Available Emergencies in Nagpur*, show the newly registered alert.
   - Click the green button: **"I CAN HELP"**.
   - Show the live Leaflet map: It plots Rahul Verma at Sitabuldi and the emergency at Wardha Road, calculating direct response distance.
   - Click **"ON THE WAY"** ➔ **"HELP STARTED"** ➔ **"HELP COMPLETED"**.

3. **Step 3 (Admin Verification & Resolution):**
   - Click **Switch ID** ➔ Select **Admin** (`admin24` / `pass24`).
   - Open the Nagpur District Command Center.
   - Show the timestamped **Activity Response Timeline** with all volunteer actions.
   - Enter resolution remarks and click **"MARK AS RESOLVED"**.
   - The incident is permanently archived as `RESOLVED`.

4. **Step 4 (AI Model Lab):**
   - Click **"AI Model Lab"** in the top navigation bar.
   - Test any custom sentence to demonstrate TF-IDF feature extraction and Naive Bayes probability distribution to the examiners.

---

## ⚠️ STEP 7: Common Windows Issues & Solutions

### Problem 1: "Script execution is disabled on this system" in PowerShell
If running `npm run dev` gives an error about `Execution_Policies`:
- Open PowerShell as Administrator, or run this quick command in your VS Code terminal:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
- Then re-run `npm run dev`.

### Problem 2: "Port 3000 is already in use"
Another app or previous session is using port 3000:
- **On Windows:** Open Command Prompt (`cmd`) and run:
  ```cmd
  netstat -ano | findstr :3000
  taskkill /PID <PID_NUMBER> /F
  ```
  *(Replace `<PID_NUMBER>` with the number shown at the far right of the netstat line)*
- Then re-run `npm run dev`.

### Problem 3: Leaflet Maps are grey or blank
- Leaflet requires an active internet connection to load OpenStreetMap tiles (`tile.openstreetmap.org`). Connect your laptop to Wi-Fi or mobile hotspot.

---

## 📁 Key Project Files Overview

- **`server.ts`**: Full-stack Express backend with REST API and Vite integration.
- **`server/db.ts`**: Local JSON persistence database (`data/sankalp_db.json`).
- **`server/ml_classifier.ts`**: Built-in TF-IDF Vectorizer + Multinomial Naive Bayes classifier.
- **`src/components/UserDashboard.tsx`**: Citizen reporting dashboard & status tracker.
- **`src/components/VolunteerDashboard.tsx`**: Volunteer dispatch station with OpenStreetMap navigation.
- **`src/components/AdminDashboard.tsx`**: Nagpur District incident command center.
- **`src/components/AuthModal.tsx`**: ID generation and authentication modal (`admin24` / `pass24`).
- **`src/components/LeafletMap.tsx`**: Interactive Leaflet.js map with custom GPS markers.

---
*Created for SANKALP Major Project 2026–2027. All components run completely offline on localhost once `npm install` is finished.*
