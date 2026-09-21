import React from 'react';
import { User, UserRole } from '../types';
import { Shield, Bell, BrainCircuit, BookOpen, RotateCcw, AlertTriangle, Radio } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
  onOpenAuthModal: () => void;
  onOpenAiInspector: () => void;
  onOpenCollegeDocs: () => void;
  onFastSos: () => void;
  onResetDemo: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onOpenAuthModal,
  onOpenAiInspector,
  onOpenCollegeDocs,
  onFastSos,
  onResetDemo,
  unreadCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & College Project Meta */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">SANKALP</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Nagpur City, Maharashtra
                </span>
                <span className="hidden sm:inline">• Zero Mile Emergency Network</span>
              </div>
            </div>
          </div>

          {/* Role Switcher for College Panel Demonstration */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="role-btn-citizen"
              onClick={() => onSwitchUser('CITIZEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser.role === 'CITIZEN'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🙋 Citizen (User)
            </button>
            <button
              id="role-btn-volunteer"
              onClick={() => onSwitchUser('VOLUNTEER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser.role === 'VOLUNTEER'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🤝 Volunteer
            </button>
            <button
              id="role-btn-admin"
              onClick={() => onSwitchUser('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser.role === 'ADMIN'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ Admin (admin24)
            </button>
          </div>

          {/* Quick Action Tools: SOS, ID Portal, AI Inspector, College Docs, Reset */}
          <div className="flex items-center gap-2">
            {/* Make / Switch ID Button */}
            <button
              id="btn-auth-id-modal"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs transition-all"
              title="Create or Switch Citizen ID / Volunteer ID / Admin Login"
            >
              <span className="font-mono text-[11px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                {currentUser.id}
              </span>
              <span className="font-semibold text-slate-800 hidden sm:inline">{currentUser.name}</span>
              <span className="text-indigo-600 font-medium hidden md:inline text-[11px]">• Switch ID</span>
            </button>

            {/* SOS button */}
            <button
              id="btn-fast-sos"
              onClick={onFastSos}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95 animate-pulse"
              title="Instant 1-Tap Emergency SOS Alert"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>

            {/* AI Inspector button */}
            <button
              id="btn-ai-inspector"
              onClick={onOpenAiInspector}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="Test TF-IDF + Naive Bayes NLP Model"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">AI Model Lab</span>
            </button>

            {/* College Project Code & Guide Viewer */}
            <button
              id="btn-college-docs"
              onClick={onOpenCollegeDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="View Complete Code & VS Code Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">Project Docs</span>
            </button>

            {/* Reset Demo */}
            <button
              id="btn-reset-demo"
              onClick={onResetDemo}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
              title="Reset to Initial Demo State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile Role Switcher */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Role:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onSwitchUser('CITIZEN')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                currentUser.role === 'CITIZEN' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => onSwitchUser('VOLUNTEER')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                currentUser.role === 'VOLUNTEER' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Volunteer
            </button>
            <button
              onClick={() => onSwitchUser('ADMIN')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                currentUser.role === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
