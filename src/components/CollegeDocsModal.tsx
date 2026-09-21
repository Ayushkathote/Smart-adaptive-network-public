import React, { useState } from 'react';
import { BookOpen, Copy, Check, X, FileCode, Download, Terminal, Laptop } from 'lucide-react';

interface CollegeDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollegeDocsModal: React.FC<CollegeDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'CODE'>('GUIDE');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const vscodeGuideContent = `# SANKALP — HOW TO RUN THIS PROJECT IN VS CODE ON YOUR LAPTOP

Project Title: SANKALP — AI-Based Smart Adaptive Network for Community Assistance & Public Safety (Nagpur Emergency Response Network)
Academic Year: 2026–2027 | B.Tech CSE Major Project
Operating System: Windows 10 / 11, macOS, or Linux

----------------------------------------------------------------------
STEP 0: HOW TO DOWNLOAD THE PROJECT TO YOUR LAPTOP
----------------------------------------------------------------------
1. In Google AI Studio, click the Settings / Menu icon (...) in the top-right corner.
2. Select "Download ZIP" (or "Export to GitHub").
3. Extract the downloaded ZIP file to a folder, e.g.:
   - Windows: C:\\Projects\\SANKALP or C:\\Users\\<YourName>\\Desktop\\SANKALP
   - Mac/Linux: ~/Projects/SANKALP

----------------------------------------------------------------------
STEP 1: INSTALL REQUIRED TOOLS ON YOUR LAPTOP
----------------------------------------------------------------------
1. Visual Studio Code: https://code.visualstudio.com/
2. Node.js (LTS v20+ or v22+): https://nodejs.org/
   Verify in terminal:
     node -v
     npm -v
3. (Optional) Python 3.10+ (Check "Add Python to PATH"): https://www.python.org/

----------------------------------------------------------------------
STEP 2: OPEN IN VS CODE
----------------------------------------------------------------------
1. Launch VS Code.
2. Click File -> Open Folder... -> Select the extracted SANKALP folder (containing package.json).
3. Open Terminal in VS Code (Ctrl + \` or menu Terminal -> New Terminal).

----------------------------------------------------------------------
STEP 3: RUN COMMANDS IN TERMINAL
----------------------------------------------------------------------
1. Install all dependencies (React 19, Express, Vite, Tailwind, Leaflet):
   npm install

2. Start the full-stack server:
   npm run dev

----------------------------------------------------------------------
STEP 4: OPEN IN BROWSER
----------------------------------------------------------------------
Open Chrome, Edge, or Firefox and go to:
👉 http://localhost:3000

----------------------------------------------------------------------
STEP 5: DEFAULT LOGIN CREDENTIALS
----------------------------------------------------------------------
1. Admin (Nagpur District Command Center):
   - Admin ID: admin24
   - Password: pass24
2. Citizen Persona:
   - ID: NAG-CIT-101 (Ananya Sharma - Dharampeth, Nagpur)
   - Or click "Generate New Citizen ID"
3. Volunteer Persona:
   - ID: NAG-VOL-201 (Rahul Verma - Sitabuldi Station, Nagpur)
   - Or click "Make Volunteer ID"

----------------------------------------------------------------------
STEP 6: QUICK VIVA DEMO SCRIPT
----------------------------------------------------------------------
1. Citizen: Click "Report Emergency" -> Enter "Road Collision on Wardha Road Near Chhatrapati Square" -> AI classifies as Road Accident (HIGH).
2. Volunteer: Switch to Volunteer -> Click "I CAN HELP" -> Leaflet map plots GPS location and route. Advance through: ON THE WAY -> HELP STARTED -> HELP COMPLETED.
3. Admin: Switch to Admin (admin24 / pass24) -> Review activity response timeline -> Click "MARK AS RESOLVED".
4. AI Lab: Click "AI Model Lab" in top bar to test TF-IDF + Naive Bayes classification with live probability scores!

----------------------------------------------------------------------
STEP 7: TROUBLESHOOTING COMMON WINDOWS ISSUES
----------------------------------------------------------------------
- PowerShell script restriction error:
  Run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
- Port 3000 already in use:
  Run in cmd: netstat -ano | findstr :3000
  Then: taskkill /PID <PID_NUMBER> /F
- Maps blank: Make sure laptop is connected to Wi-Fi to load OpenStreetMap tiles.
`;

  const codeBundleSummary = `# SANKALP — MAJOR PROJECT CODE DIRECTORY SUMMARY

1. BACKEND & SERVER:
   - /server.ts: Express REST API, Vite middleware, real-time endpoints
   - /server/db.ts: Persistent JSON database (data/sankalp_db.json) with role state machine
   - /server/ml_classifier.ts: Mathematical TF-IDF Vectorizer + Multinomial Naive Bayes classifier

2. PYTHON ML SUBSYSTEM:
   - /ml_pipeline/train_model.py: scikit-learn Pipeline (TfidfVectorizer + MultinomialNB)
   - /ml_pipeline/predict.py: CLI verification utility
   - /ml_pipeline/dataset.csv: 60+ curated incident reports across 8 categories
   - /ml_pipeline/requirements.txt: scikit-learn, numpy, pandas, joblib

3. FRONTEND INTERFACES:
   - /src/types.ts: TypeScript interfaces for User, Incident, VolunteerAssignment, Timeline
   - /src/components/LeafletMap.tsx: Interactive OpenStreetMap with Leaflet.js pins & route
   - /src/components/UserDashboard.tsx: Citizen emergency reporting & live tracking
   - /src/components/VolunteerDashboard.tsx: "I CAN HELP" dispatch & GPS navigation
   - /src/components/AdminDashboard.tsx: Master command center, response timeline & resolution
   - /src/components/AiInspectorModal.tsx: Examiner NLP test lab
   - /src/components/Navbar.tsx: RBAC persona switcher & SOS trigger
   - /src/App.tsx: State coordinator & live polling engine
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">College Major Project Deliverables</h2>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  2026–2027
                </span>
              </div>
              <p className="text-xs text-slate-300">
                The 2 files requested for running in VS Code on Windows &amp; complete project source code.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'GUIDE'
                ? 'bg-white text-blue-700 border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            File 1: How to Run in VS Code on Laptop (HOW_TO_RUN_IN_VS_CODE.md)
          </button>

          <button
            onClick={() => setActiveTab('CODE')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 border-t border-x ${
              activeTab === 'CODE'
                ? 'bg-white text-blue-700 border-slate-200 -mb-px shadow-xs'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            File 2: All Project Code Summary (PROJECT_COMPLETE_CODE_BUNDLE.md)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-mono text-xs">
          
          <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200">
            <span className="font-sans font-bold text-slate-700">
              {activeTab === 'GUIDE' ? 'HOW_TO_RUN_IN_VS_CODE.md' : 'PROJECT_COMPLETE_CODE_BUNDLE.md'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleCopy(activeTab === 'GUIDE' ? vscodeGuideContent : codeBundleSummary)
                }
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-sans font-semibold border border-slate-200 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy File Content'}
              </button>
              <button
                onClick={() =>
                  handleDownload(
                    activeTab === 'GUIDE' ? 'HOW_TO_RUN_IN_VS_CODE.md' : 'PROJECT_COMPLETE_CODE_BUNDLE.md',
                    activeTab === 'GUIDE' ? vscodeGuideContent : codeBundleSummary
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download {activeTab === 'GUIDE' ? 'HOW_TO_RUN_IN_VS_CODE.md' : 'Bundle'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {activeTab === 'GUIDE' ? vscodeGuideContent : codeBundleSummary}
          </pre>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Both files are saved directly in your workspace root directory.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-800"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
