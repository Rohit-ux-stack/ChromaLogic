import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  isAuthorizedAdmin,
  db,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type { User } from 'firebase/auth';
import { usePortfolioData } from '../hooks/usePortfolioData';
import type {
  ProfileData,
  ProjectData,
  VideoData,
  SocialData,
  SocialPlatform,
} from '../types';
import {
  Shield,
  LogOut,
  ExternalLink,
  ArrowLeft,
  User as UserIcon,
  FolderGit2,
  Video,
  Share2,
  FileText,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  X,
  Sparkles,
  Palette,
} from 'lucide-react';
import { getYouTubeThumbnail } from '../utils/youtube';
import { ImageBlobUploader } from './ImageBlobUploader';
import { MultiImageUploader } from './MultiImageUploader';
import { formatAuthError } from '../utils/authErrors';
import { DesignsAdminTab } from './DesignsAdminTab';

export function AdminVault() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'designs' | 'videos' | 'socials' | 'resume'>('profile');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const portfolio = usePortfolioData();

  // Set robots noindex and title for admin route
  useEffect(() => {
    document.title = 'Vault // DataPulse Security Command';
    
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = 'DataPulse — Rohit Banerjee';
      metaRobots?.setAttribute('content', 'index, follow');
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Toast status auto-clear
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setLoginError(null);
    setSubmittingAuth(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-in caught:', err);
      const formatted = formatAuthError(err);
      if (formatted) {
        setLoginError(formatted);
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Email/Password Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setLoginError('Email and password required.');
      return;
    }
    setLoginError(null);
    setSubmittingAuth(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (err: unknown) {
      console.error('Email Sign-in error:', err);
      setLoginError('ACCESS DENIED: Invalid administrator credentials.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      navigate('/', { replace: true });
    }
  };

  // 1. Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-cyan-400 font-mono flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <div className="text-xs uppercase tracking-widest text-neutral-400">
            INITIALIZING SECURE VAULT ENVIRONMENT...
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col justify-between relative overflow-hidden selection:bg-[#00FFFF] selection:text-black">
        {/* Dot matrix grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#00FFFF 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Terminal Bar */}
        <header className="p-6 md:p-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button
              id="back-to-portfolio-btn"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-surface-subtle text-xs font-mono text-neutral-300 hover:text-white hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all cursor-pointer min-h-[38px] touch-target"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back to Portfolio</span>
            </button>

            <div className="hidden sm:flex font-mono text-xs text-cyan-400 tracking-widest uppercase items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>TERMINAL // VAULT-9X2K1</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/90 shadow-sm shadow-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90 shadow-sm shadow-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/90 shadow-sm shadow-green-500/40" />
          </div>
        </header>

        {/* Center Auth Card */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-20">
          <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Top gradient glow bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80" />

            <div className="text-center mb-8">
              <div className="inline-block p-3.5 rounded-full bg-white/5 border border-purple-500/30 mb-4 shadow-inner">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-lg font-mono text-cyan-300 tracking-widest uppercase mb-1 font-bold">
                Identity Verification
              </h2>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono">
                Administrator access required
              </p>
            </div>

            {/* Error notice */}
            {loginError && (
              <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-mono flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Continue with Google */}
              <button
                id="admin-google-signin-btn"
                type="button"
                disabled={submittingAuth}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-200 text-black font-semibold text-sm py-3.5 px-4 rounded-2xl transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-white/10" />
                <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
                  OR
                </div>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                    Access ID
                  </label>
                  <input
                    id="admin-email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email@datapulse.io"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">
                    Secure Code
                  </label>
                  <input
                    id="admin-password-input"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none transition-colors font-mono"
                  />
                </div>

                <button
                  id="admin-auth-submit-btn"
                  type="submit"
                  disabled={submittingAuth}
                  className="w-full bg-transparent border border-purple-500/50 hover:border-purple-400 text-purple-300 hover:bg-purple-950/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] font-mono text-xs tracking-widest py-3.5 rounded-xl transition-all uppercase mt-2 font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingAuth ? 'Authenticating...' : 'Authenticate'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Terminal Telemetry Bar */}
        <footer className="p-6 md:p-8 border-t border-white/10 bg-black/40 backdrop-blur-md z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 opacity-60 font-mono text-[10px] tracking-[0.2em] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>FIRESTORE: CONNECTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>AUTH: ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>BASE64 BLOB ENGINE: READY</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized User (ACCESS DENIED)
  const isAuthorized = isAuthorizedAdmin(user.email);
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] text-neutral-200 font-mono flex flex-col justify-between p-6 relative overflow-hidden selection:bg-red-500 selection:text-black">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#EF4444 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px',
          }}
        />

        <header className="p-4 flex items-center justify-between border-b border-red-500/20 bg-black/40 backdrop-blur-md z-20">
          <div className="font-mono text-xs text-red-400 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>SECURITY ALERT // ACCESS REJECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 z-20">
          <div className="w-full max-w-lg bg-white/5 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-400 tracking-wider font-mono">
                ACCESS DENIED: UNAUTHORIZED ACCOUNT
              </h1>
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-mono">
                Security clearance rejected for {user.email}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-left text-xs space-y-2">
              <div className="text-neutral-500">Authenticated Identity:</div>
              <div className="text-neutral-200 font-bold truncate">
                {user.email || 'Anonymous / Unverified Provider'}
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed pt-1">
                Your account is authenticated with Firebase but is not on the authorized administrator allowlist for the ChromaLogic command vault.
              </p>
            </div>

            <button
              id="unauthorized-disconnect-btn"
              onClick={handleSignOut}
              className="w-full py-3.5 rounded-2xl bg-red-900/40 hover:bg-red-850 border border-red-700/50 text-red-200 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] touch-target active:scale-98 shadow-lg shadow-red-950/40"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>DISCONNECT & RETURN TO PORTFOLIO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated & Authorized Admin Dashboard
  return (
    <div className="min-h-screen bg-[#06080d] text-neutral-200 font-sans selection:bg-purple-500 selection:text-black flex flex-col relative overflow-hidden">
      {/* Dark Ambient Liquid Glass Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full opacity-20 blur-[100px] animate-liquid-orb-1"
          style={{ background: 'radial-gradient(circle, #D96C51 0%, #a855f7 50%, transparent 80%)' }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full opacity-20 blur-[110px] animate-liquid-orb-2"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, #3b82f6 50%, transparent 80%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#00FFFF 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Top HUD Bar */}
      <header className="bg-[#090d15]/80 backdrop-blur-xl border-b border-neutral-800/80 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white tracking-wider">
              <span>CHROMALOGIC // VAULT</span>
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-purple-300/80">
              OPERATIONAL • ROOT GRANTED
            </div>
          </div>
        </div>

        {/* Action icons / Identity */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[200px]">{user.email}</span>
          </div>

          <Link
            to="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-400/50 text-xs font-mono text-neutral-300 hover:text-purple-200 transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          >
            <span>View Visitor Display</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </Link>

          <button
            id="admin-signout-btn"
            onClick={handleSignOut}
            title="Terminate session and return to selection gateway"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-mono text-red-200 transition-all cursor-pointer min-h-[40px] touch-target active:scale-98 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span className="font-semibold">Terminate</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Navigation Tabs */}
        <aside className="w-full md:w-64 shrink-0 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 px-3 py-2 flex items-center justify-between">
            <span>REPOSITORY MODULES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 md:gap-1.5">
            <button
              id="tab-profile-btn"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-mono text-xs tracking-wide transition-all text-left min-h-[44px] cursor-pointer touch-target ${
                activeTab === 'profile'
                  ? 'glass-surface-violet text-purple-200 shadow-lg shadow-purple-950/30 border-purple-400/50 ring-1 ring-purple-400/30'
                  : 'glass-surface-subtle text-neutral-300 hover:text-white hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              }`}
            >
              <UserIcon className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-semibold">Profile Identity</span>
            </button>

            <button
              id="tab-projects-btn"
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-xs tracking-wide transition-all text-left min-h-[44px] cursor-pointer touch-target ${
                activeTab === 'projects'
                  ? 'glass-surface-violet text-purple-200 shadow-lg shadow-purple-950/30 border-purple-400/50 ring-1 ring-purple-400/30'
                  : 'glass-surface-subtle text-neutral-300 hover:text-white hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-semibold">Projects</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full glass-surface text-neutral-300">
                {portfolio.projects.length}
              </span>
            </button>

            <button
              id="tab-designs-btn"
              onClick={() => setActiveTab('designs')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-xs tracking-wide transition-all text-left min-h-[44px] cursor-pointer touch-target ${
                activeTab === 'designs'
                  ? 'glass-surface-violet text-purple-200 shadow-lg shadow-purple-950/30 border-purple-400/50 ring-1 ring-purple-400/30'
                  : 'glass-surface-subtle text-neutral-300 hover:text-white hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">Graphic Designs</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full glass-surface text-neutral-300">
                {portfolio.designs.length}
              </span>
            </button>

            <button
              id="tab-videos-btn"
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-xs tracking-wide transition-all text-left min-h-[44px] cursor-pointer touch-target ${
                activeTab === 'videos'
                  ? 'glass-surface-violet text-purple-200 shadow-lg shadow-purple-950/30 border-purple-400/50 ring-1 ring-purple-400/30'
                  : 'glass-surface-subtle text-neutral-300 hover:text-white hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">Videos</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full glass-surface text-neutral-300">
                {portfolio.videos.length}
              </span>
            </button>

            <button
              id="tab-socials-btn"
              onClick={() => setActiveTab('socials')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-mono text-xs tracking-wide transition-all text-left min-h-[44px] cursor-pointer touch-target ${
                activeTab === 'socials'
                  ? 'glass-surface-violet text-purple-200 shadow-lg shadow-purple-950/30 border-purple-400/50 ring-1 ring-purple-400/30'
                  : 'glass-surface-subtle text-neutral-300 hover:text-white hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Share2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold">Socials</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full glass-surface text-neutral-300">
                {portfolio.socials.length}
              </span>
            </button>

            <button
              id="tab-resume-btn"
              onClick={() => setActiveTab('resume')}
              className={`w-full col-span-2 sm:col-span-1 flex items-center gap-3 px-4 py-3 rounded-2xl font-mono text-xs tracking-wide transition-all text-left min-h-[44px] cursor-pointer touch-target ${
                activeTab === 'resume'
                  ? 'glass-surface-violet text-purple-200 shadow-lg shadow-purple-950/30 border-purple-400/50 ring-1 ring-purple-400/30'
                  : 'glass-surface-subtle text-neutral-300 hover:text-white hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">Resume Link</span>
            </button>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-1 min-w-0">
          {/* Status Toast */}
          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-mono flex items-center gap-3 animate-in fade-in shadow-xl ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 shadow-emerald-950/30'
                  : 'bg-red-950/70 border border-red-500/60 text-red-300 shadow-red-950/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileAdminTab
              initialProfile={portfolio.profile}
              onNotify={(text, type) => setStatusMessage({ text, type })}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsAdminTab
              projects={portfolio.projects}
              onNotify={(text, type) => setStatusMessage({ text, type })}
            />
          )}

          {activeTab === 'designs' && (
            <DesignsAdminTab
              designs={portfolio.designs}
              onNotify={(text, type) => setStatusMessage({ text, type })}
            />
          )}

          {activeTab === 'videos' && (
            <VideosAdminTab
              videos={portfolio.videos}
              onNotify={(text, type) => setStatusMessage({ text, type })}
            />
          )}

          {activeTab === 'socials' && (
            <SocialsAdminTab
              socials={portfolio.socials}
              onNotify={(text, type) => setStatusMessage({ text, type })}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeAdminTab
              initialResume={portfolio.resume}
              onNotify={(text, type) => setStatusMessage({ text, type })}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Profile Tab Component (Singleton)
// ---------------------------------------------------------------------------
function ProfileAdminTab({
  initialProfile,
  onNotify,
}: {
  initialProfile: ProfileData | null;
  onNotify: (text: string, type: 'success' | 'error') => void;
}) {
  const [name, setName] = useState('Rohit Banerjee');
  const [photoUrl, setPhotoUrl] = useState('');
  const [ogBannerUrl, setOgBannerUrl] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [stat1Title, setStat1Title] = useState('');
  const [stat1Desc, setStat1Desc] = useState('');
  const [stat2Title, setStat2Title] = useState('');
  const [stat2Desc, setStat2Desc] = useState('');
  const [stat3Title, setStat3Title] = useState('');
  const [stat3Desc, setStat3Desc] = useState('');
  const [saving, setSaving] = useState(false);

  // Load existing profile when available
  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || 'Rohit Banerjee');
      setPhotoUrl(initialProfile.photoUrl || '');
      setOgBannerUrl(initialProfile.ogBannerUrl || '');
      setTagline(initialProfile.tagline || '');
      setBio(initialProfile.bio || '');
      setEmail(initialProfile.email || '');
      setLocation(initialProfile.location || '');
      setSkills(initialProfile.skills || '');
      setStat1Title(initialProfile.stat1Title || '');
      setStat1Desc(initialProfile.stat1Desc || '');
      setStat2Title(initialProfile.stat2Title || '');
      setStat2Desc(initialProfile.stat2Desc || '');
      setStat3Title(initialProfile.stat3Title || '');
      setStat3Desc(initialProfile.stat3Desc || '');
    }
  }, [initialProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docId = initialProfile?.id || 'main-profile';
      const profileDocRef = doc(db, 'content', docId);

      const payload = {
        type: 'profile',
        name: name.trim() || 'Rohit Banerjee',
        photoUrl: photoUrl.trim(),
        ogBannerUrl: ogBannerUrl.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        email: email.trim(),
        location: location.trim(),
        skills: skills.trim(),
        stat1Title: stat1Title.trim(),
        stat1Desc: stat1Desc.trim(),
        stat2Title: stat2Title.trim(),
        stat2Desc: stat2Desc.trim(),
        stat3Title: stat3Title.trim(),
        stat3Desc: stat3Desc.trim(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(profileDocRef, payload, { merge: true });
      onNotify('Profile singleton successfully synchronized to Firestore.', 'success');
    } catch (err: unknown) {
      handleFirestoreError(err, OperationType.WRITE, 'content/profile');
      onNotify('Failed to save profile. Check Firestore permissions.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-surface rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl border border-white/10">
      <div>
        <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>IDENTITY // SINGLETON CONFIGURATION</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
          Profile Identity Configuration
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
          Maintains the master profile singleton for Rohit Banerjee stored securely in Firebase Firestore as base64-encoded blobs and metadata.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Field 1: Full Name */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
            Full Name
          </label>
          <input
            id="profile-fullname-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rohit Banerjee"
            className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 min-h-[44px]"
          />
        </div>

        {/* Field 2: Photo Blob Upload + Live Circular Preview */}
        <ImageBlobUploader
          idPrefix="profile-avatar"
          label="Profile Avatar (Base64 Blob Storage)"
          helperText="Upload your avatar image. It will be compressed and stored directly as a high-resolution base64 Blob in Firestore."
          value={photoUrl}
          onChange={(newBlob) => setPhotoUrl(newBlob)}
          previewShape="circle"
          recommendedAspect="1:1"
        />

        {/* Field 3: OG Banner Image Blob Upload + Live 1200:630 Preview */}
        <ImageBlobUploader
          idPrefix="profile-ogbanner"
          label="OG Social Share Banner (Base64 Blob Storage)"
          helperText="Upload a 1200×630px social card preview image for Twitter, LinkedIn, and messaging link unfurls."
          value={ogBannerUrl}
          onChange={(newBlob) => setOgBannerUrl(newBlob)}
          previewShape="banner"
          recommendedAspect="1200:630"
        />

        {/* Field 4: Tagline */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
            Tagline
          </label>
          <input
            id="profile-tagline-input"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Data Scientist & Systems Engineer"
            className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 min-h-[44px]"
          />
        </div>

        {/* Field 5: Bio */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
            Bio
          </label>
          <textarea
            id="profile-bio-input"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write your professional overview and technical journey..."
            className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>

        {/* Field 6 & 7: Email and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              Email (Optional)
            </label>
            <input
              id="profile-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohit@example.com"
              className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
              Location (Optional)
            </label>
            <input
              id="profile-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 min-h-[44px]"
            />
          </div>
        </div>

        {/* Field 8: Skills */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
            Skills (Comma-separated)
          </label>
          <input
            id="profile-skills-input"
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Python, TensorFlow, React, SQL, Cloud Architecture"
            className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 min-h-[44px]"
          />
        </div>

        {/* Highlight Stats Configuration */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <span>3-Item Highlights / Stats Bar</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={stat1Title} onChange={(e) => setStat1Title(e.target.value)} placeholder="Stat 1 Title (e.g. Full-Stack)" className="px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none" />
            <input type="text" value={stat1Desc} onChange={(e) => setStat1Desc(e.target.value)} placeholder="Stat 1 Desc (e.g. Cloud Architecture)" className="px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={stat2Title} onChange={(e) => setStat2Title(e.target.value)} placeholder="Stat 2 Title" className="px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none" />
            <input type="text" value={stat2Desc} onChange={(e) => setStat2Desc(e.target.value)} placeholder="Stat 2 Desc" className="px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={stat3Title} onChange={(e) => setStat3Title(e.target.value)} placeholder="Stat 3 Title" className="px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none" />
            <input type="text" value={stat3Desc} onChange={(e) => setStat3Desc(e.target.value)} placeholder="Stat 3 Desc" className="px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none" />
          </div>
        </div>

        {/* Submit */}
        <button
          id="profile-save-btn"
          type="submit"
          disabled={saving}
          className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] active:scale-98 disabled:opacity-50 min-h-[48px] touch-target"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>SAVING PROFILE...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>SAVE PROFILE SINGLETON</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Projects Tab Component (Dynamic Multi-Entry Forms & Base64 Image Blobs)
// ---------------------------------------------------------------------------
interface ProjectDraft {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  images: string[];
  techStack: string;
  purpose: string;
  story: string;
  howItWorks: string;
  githubUrl: string;
  youtubeUrl: string;
  order: number;
}

function emptyProjectDraft(id: string, order: number): ProjectDraft {
  return {
    id,
    title: '',
    description: '',
    imageUrl: '',
    images: [],
    techStack: '',
    purpose: '',
    story: '',
    howItWorks: '',
    githubUrl: '',
    youtubeUrl: '',
    order,
  };
}

function ProjectsAdminTab({
  projects,
  onNotify,
}: {
  projects: ProjectData[];
  onNotify: (text: string, type: 'success' | 'error') => void;
}) {
  // Dynamic multiple form blocks state
  const [drafts, setDrafts] = useState<ProjectDraft[]>([
    emptyProjectDraft(`draft-proj-${Date.now()}`, projects.length + 1),
  ]);
  const [submittingDraftIds, setSubmittingDraftIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addNewDraft = () => {
    setDrafts((prev) => [
      ...prev,
      emptyProjectDraft(`draft-proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, projects.length + prev.length + 1),
    ]);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        return [emptyProjectDraft(`draft-proj-${Date.now()}`, projects.length + 1)];
      }
      return remaining;
    });
  };

  const updateDraft = (id: string, field: keyof ProjectDraft, value: string | number | string[]) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Editing state for updating existing projects
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editTechStack, setEditTechStack] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editHowItWorks, setEditHowItWorks] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = (proj: ProjectData) => {
    setEditingProject(proj);
    setEditTitle(proj.title);
    setEditDescription(proj.description || '');
    setEditImages(proj.images && proj.images.length > 0 ? proj.images : proj.imageUrl ? [proj.imageUrl] : []);
    setEditTechStack(proj.techStack || '');
    setEditPurpose(proj.purpose || '');
    setEditStory(proj.story || '');
    setEditHowItWorks(proj.howItWorks || '');
    setEditGithubUrl(proj.githubUrl || '');
    setEditYoutubeUrl(proj.youtubeUrl || '');
    setEditOrder(proj.order);
  };

  const cancelEdit = () => {
    setEditingProject(null);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    if (!editTitle.trim()) {
      onNotify('Project title is required.', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const docRef = doc(db, 'content', editingProject.id);
      await setDoc(
        docRef,
        {
          type: 'project',
          title: editTitle.trim(),
          description: editDescription.trim(),
          imageUrl: editImages[0] || '',
          images: editImages,
          techStack: editTechStack.trim(),
          purpose: editPurpose.trim(),
          story: editStory.trim(),
          howItWorks: editHowItWorks.trim(),
          githubUrl: editGithubUrl.trim(),
          youtubeUrl: editYoutubeUrl.trim(),
          order: Number(editOrder) || 0,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setEditingProject(null);
      onNotify('Project updated successfully in Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `content/${editingProject.id}`);
      onNotify('Failed to update project.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveDraft = async (draft: ProjectDraft) => {
    if (!draft.title.trim()) {
      onNotify('Project title is required.', 'error');
      return;
    }

    setSubmittingDraftIds((prev) => new Set(prev).add(draft.id));
    try {
      const contentCollection = collection(db, 'content');
      await addDoc(contentCollection, {
        type: 'project',
        title: draft.title.trim(),
        description: draft.description.trim(),
        imageUrl: draft.images[0] || '',
        images: draft.images,
        techStack: draft.techStack.trim(),
        purpose: draft.purpose.trim(),
        story: draft.story.trim(),
        howItWorks: draft.howItWorks.trim(),
        githubUrl: draft.githubUrl.trim(),
        youtubeUrl: draft.youtubeUrl.trim(),
        order: Number(draft.order) || 0,
        createdAt: new Date().toISOString(),
      });

      removeDraft(draft.id);
      onNotify(`Project "${draft.title.trim()}" saved to Firestore successfully.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'content/project');
      onNotify('Failed to create project document.', 'error');
    } finally {
      setSubmittingDraftIds((prev) => {
        const next = new Set(prev);
        next.delete(draft.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'content', id));
      onNotify('Project removed from Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `content/${id}`);
      onNotify('Failed to delete project.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Edit Project Modal / Panel */}
      {editingProject && (
        <div className="glass-surface-elevated rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-purple-400/50 ring-4 ring-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Editing Project: {editingProject.title}
              </h3>
            </div>
            <button
              onClick={cancelEdit}
              className="p-2 rounded-xl glass-surface hover:text-white text-neutral-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={editTechStack}
                onChange={(e) => setEditTechStack(e.target.value)}
                placeholder="e.g. React, Node.js, MongoDB, Tailwind"
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Purpose / Objective (Optional)
              </label>
              <textarea
                rows={2}
                value={editPurpose}
                onChange={(e) => setEditPurpose(e.target.value)}
                placeholder="What problem does this project solve?"
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Story Behind Its Creation (Optional)
              </label>
              <textarea
                rows={3}
                value={editStory}
                onChange={(e) => setEditStory(e.target.value)}
                placeholder="What inspired this project, and how did it come together?"
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                How It Works (Optional)
              </label>
              <textarea
                rows={3}
                value={editHowItWorks}
                onChange={(e) => setEditHowItWorks(e.target.value)}
                placeholder="Explain the architecture, flow, or mechanics of how it actually works..."
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
              />
            </div>

            <MultiImageUploader
              idPrefix={`edit-project-images-${editingProject.id}`}
              label="Project Screenshots (Carousel Images)"
              helperText="Upload, crop, and reorder the screenshots visitors will browse through in the project carousel & popup. The first image is the cover."
              value={editImages}
              onChange={setEditImages}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  GitHub Repository URL (Optional)
                </label>
                <input
                  type="url"
                  value={editGithubUrl}
                  onChange={(e) => setEditGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  YouTube Demo URL (Optional)
                </label>
                <input
                  type="url"
                  value={editYoutubeUrl}
                  onChange={(e) => setEditYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingEdit}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50 min-h-[44px]"
              >
                {savingEdit ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>SAVING CHANGES...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>UPDATE PROJECT</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-3 rounded-2xl glass-surface hover:bg-white/10 text-neutral-300 text-xs font-mono transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header with Dynamic Add New Form Block button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>REPOSITORIES // MULTI-ENTRY WORKSPACE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            Add Featured Projects
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            Publish project entries with optional repository links, demo references, and direct base64 blob screenshot storage.
          </p>
        </div>

        {/* Distinct Outline "+ ADD NEW" Button */}
        <button
          type="button"
          onClick={addNewDraft}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl border-2 border-dashed border-cyan-400/60 hover:border-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-98 min-h-[44px] touch-target"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>+ ADD NEW FORM BLOCK</span>
        </button>
      </div>

      {/* Dynamic Form Draft Blocks List */}
      <div className="space-y-6">
        {drafts.map((draft, draftIdx) => {
          const isSubmitting = submittingDraftIds.has(draft.id);

          return (
            <div
              key={draft.id}
              className="glass-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-purple-500/20 relative"
            >
              {/* Draft Block Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">
                    {draftIdx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {draft.title.trim() ? draft.title : `New Project Draft #${draftIdx + 1}`}
                  </h3>
                </div>

                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    className="text-xs font-mono text-neutral-400 hover:text-red-400 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove this draft block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDraft(draft);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => updateDraft(draft.id, 'title', e.target.value)}
                      placeholder="e.g. Distributed Analytics Engine"
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={draft.order}
                      onChange={(e) => updateDraft(draft.id, 'order', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(e) => updateDraft(draft.id, 'description', e.target.value)}
                    placeholder="Explain the architectural scope, methodologies, and technical stack..."
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={draft.techStack}
                    onChange={(e) => updateDraft(draft.id, 'techStack', e.target.value)}
                    placeholder="e.g. React, Node.js, MongoDB, Tailwind"
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Purpose / Objective (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={draft.purpose}
                    onChange={(e) => updateDraft(draft.id, 'purpose', e.target.value)}
                    placeholder="What problem does this project solve?"
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Story Behind Its Creation (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.story}
                    onChange={(e) => updateDraft(draft.id, 'story', e.target.value)}
                    placeholder="What inspired this project, and how did it come together?"
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    How It Works (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.howItWorks}
                    onChange={(e) => updateDraft(draft.id, 'howItWorks', e.target.value)}
                    placeholder="Explain the architecture, flow, or mechanics of how it actually works..."
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Project Showcase Multi-Image Carousel Upload */}
                <MultiImageUploader
                  idPrefix={`project-images-${draft.id}`}
                  label="Project Screenshots (Carousel Images)"
                  helperText="Select multiple screenshots, mockups, or diagrams at once, then crop/rotate each individually. The first image becomes the cover."
                  value={draft.images}
                  onChange={(imgs) => updateDraft(draft.id, 'images', imgs)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      GitHub Repository URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={draft.githubUrl}
                      onChange={(e) => updateDraft(draft.id, 'githubUrl', e.target.value)}
                      placeholder="https://github.com/rohit/repository"
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      YouTube Demo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={draft.youtubeUrl}
                      onChange={(e) => updateDraft(draft.id, 'youtubeUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-purple-400 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Primary Solid Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] active:scale-98 disabled:opacity-50 min-h-[48px] touch-target"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>SAVING TO FIRESTORE...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>ADD PROJECT ENTRY</span>
                      </>
                    )}
                  </button>

                  {/* Append Another Block Quick Button */}
                  <button
                    type="button"
                    onClick={addNewDraft}
                    className="px-4 py-3 rounded-2xl border border-cyan-400/40 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ADD ANOTHER DRAFT</span>
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      {/* Real-time List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-400">
            SAVED PROJECTS REPOSITORY ({projects.length})
          </h3>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 rounded-3xl glass-surface-subtle text-center text-xs font-mono text-neutral-400">
            NO PROJECTS SAVED IN FIRESTORE YET.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 sm:p-6 rounded-3xl glass-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {proj.imageUrl && (
                    <div className="w-24 h-16 rounded-xl bg-neutral-950 overflow-hidden border border-purple-400/30 shrink-0 shadow-md">
                      <img
                        src={proj.imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950/50 border border-purple-500/30 text-purple-300">
                        #{proj.order}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                    </div>
                    {proj.description && (
                      <p className="text-xs text-neutral-300 line-clamp-2">{proj.description}</p>
                    )}
                    {proj.githubUrl && (
                      <div className="text-[11px] text-neutral-400 font-mono truncate max-w-sm">
                        {proj.githubUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => startEdit(proj)}
                    className="px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 text-xs font-mono border border-purple-500/40 transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] touch-target hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-purple-300" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    disabled={deletingId === proj.id}
                    className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono border border-red-800/40 transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] touch-target hover:shadow-red-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Videos Tab Component (Dynamic Multi-Entry Forms)
// ---------------------------------------------------------------------------
interface VideoDraft {
  id: string;
  title: string;
  youtubeUrl: string;
  order: number;
}

function VideosAdminTab({
  videos,
  onNotify,
}: {
  videos: VideoData[];
  onNotify: (text: string, type: 'success' | 'error') => void;
}) {
  const [drafts, setDrafts] = useState<VideoDraft[]>([
    {
      id: `draft-video-${Date.now()}`,
      title: '',
      youtubeUrl: '',
      order: videos.length + 1,
    },
  ]);
  const [submittingDraftIds, setSubmittingDraftIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addNewDraft = () => {
    setDrafts((prev) => [
      ...prev,
      {
        id: `draft-video-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: '',
        youtubeUrl: '',
        order: videos.length + prev.length + 1,
      },
    ]);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        return [
          {
            id: `draft-video-${Date.now()}`,
            title: '',
            youtubeUrl: '',
            order: videos.length + 1,
          },
        ];
      }
      return remaining;
    });
  };

  const updateDraft = (id: string, field: keyof VideoDraft, value: string | number) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSaveDraft = async (draft: VideoDraft) => {
    if (!draft.title.trim()) {
      onNotify('Video title is required.', 'error');
      return;
    }

    setSubmittingDraftIds((prev) => new Set(prev).add(draft.id));
    try {
      const contentCollection = collection(db, 'content');
      await addDoc(contentCollection, {
        type: 'video',
        title: draft.title.trim(),
        youtubeUrl: draft.youtubeUrl.trim(),
        order: Number(draft.order) || 0,
        createdAt: new Date().toISOString(),
      });

      removeDraft(draft.id);
      onNotify(`Video "${draft.title.trim()}" added to Firestore successfully.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'content/video');
      onNotify('Failed to add video document.', 'error');
    } finally {
      setSubmittingDraftIds((prev) => {
        const next = new Set(prev);
        next.delete(draft.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'content', id));
      onNotify('Video removed from Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `content/${id}`);
      onNotify('Failed to delete video.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Dynamic Add New Form Block button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>MEDIA STREAM // MULTI-ENTRY REGISTRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            Add Featured Videos
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            Register YouTube technical walkthroughs, presentations, or demos with real-time thumbnail resolution.
          </p>
        </div>

        {/* Distinct Outline "+ ADD NEW" Button */}
        <button
          type="button"
          onClick={addNewDraft}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl border-2 border-dashed border-rose-400/60 hover:border-rose-300 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.25)] active:scale-98 min-h-[44px] touch-target"
        >
          <Plus className="w-4 h-4 text-rose-400" />
          <span>+ ADD NEW FORM BLOCK</span>
        </button>
      </div>

      {/* Dynamic Form Draft Blocks List */}
      <div className="space-y-6">
        {drafts.map((draft, draftIdx) => {
          const isSubmitting = submittingDraftIds.has(draft.id);
          const previewThumbnail = draft.youtubeUrl ? getYouTubeThumbnail(draft.youtubeUrl) : null;

          return (
            <div
              key={draft.id}
              className="glass-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-rose-500/20 relative"
            >
              {/* Draft Block Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-400/40 text-rose-300 font-mono text-xs font-bold flex items-center justify-center">
                    {draftIdx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {draft.title.trim() ? draft.title : `New Video Draft #${draftIdx + 1}`}
                  </h3>
                </div>

                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    className="text-xs font-mono text-neutral-400 hover:text-red-400 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove this draft block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDraft(draft);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => updateDraft(draft.id, 'title', e.target.value)}
                      placeholder="e.g. Deep Dive into Distributed Systems"
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-rose-400 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={draft.order}
                      onChange={(e) => updateDraft(draft.id, 'order', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-rose-400 focus:outline-none font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    YouTube Demo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={draft.youtubeUrl}
                    onChange={(e) => updateDraft(draft.id, 'youtubeUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-rose-400 focus:outline-none min-h-[44px]"
                  />
                </div>

                {/* Live Thumbnail Preview */}
                {previewThumbnail && (
                  <div className="p-4 rounded-2xl glass-surface-subtle flex items-center gap-4 max-w-sm border border-rose-500/20">
                    <div className="w-20 aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow-md">
                      <img
                        src={previewThumbnail}
                        alt="YouTube Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-xs text-neutral-300 font-mono">
                      <div className="text-emerald-400 font-bold">THUMBNAIL RESOLVED</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Primary Solid Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 hover:from-rose-400 hover:to-indigo-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] active:scale-98 disabled:opacity-50 min-h-[48px] touch-target"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>SAVING VIDEO...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>ADD VIDEO ENTRY</span>
                      </>
                    )}
                  </button>

                  {/* Append Another Block Quick Button */}
                  <button
                    type="button"
                    onClick={addNewDraft}
                    className="px-4 py-3 rounded-2xl border border-rose-400/40 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ADD ANOTHER DRAFT</span>
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      {/* Real-time List */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-400 px-1">
          SAVED VIDEOS ({videos.length})
        </h3>

        {videos.length === 0 ? (
          <div className="p-8 rounded-3xl glass-surface-subtle text-center text-xs font-mono text-neutral-400">
            NO VIDEOS SAVED IN FIRESTORE YET.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((vid) => {
              const thumb = getYouTubeThumbnail(vid.youtubeUrl);
              return (
                <div
                  key={vid.id}
                  className="p-5 rounded-3xl glass-surface flex flex-col justify-between gap-4 shadow-lg hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all"
                >
                  <div className="space-y-2.5">
                    {thumb && (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-md">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-300">
                        #{vid.order}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">{vid.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[180px]">
                      {vid.youtubeUrl || 'No URL'}
                    </span>
                    <button
                      onClick={() => handleDelete(vid.id)}
                      disabled={deletingId === vid.id}
                      className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono border border-red-800/40 transition-all flex items-center gap-1 cursor-pointer min-h-[40px] touch-target"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Socials Tab Component (Dynamic Multi-Entry Forms)
// ---------------------------------------------------------------------------
interface SocialDraft {
  id: string;
  platform: SocialPlatform;
  socialUrl: string;
  order: number;
}

function SocialsAdminTab({
  socials,
  onNotify,
}: {
  socials: SocialData[];
  onNotify: (text: string, type: 'success' | 'error') => void;
}) {
  const supportedPlatforms: SocialPlatform[] = [
    'GitHub',
    'LinkedIn',
    'YouTube',
    'Instagram',
    'Twitter/X',
    'Other',
  ];

  const [drafts, setDrafts] = useState<SocialDraft[]>([
    {
      id: `draft-social-${Date.now()}`,
      platform: 'GitHub',
      socialUrl: '',
      order: socials.length + 1,
    },
  ]);
  const [submittingDraftIds, setSubmittingDraftIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addNewDraft = () => {
    setDrafts((prev) => [
      ...prev,
      {
        id: `draft-social-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        platform: 'GitHub',
        socialUrl: '',
        order: socials.length + prev.length + 1,
      },
    ]);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        return [
          {
            id: `draft-social-${Date.now()}`,
            platform: 'GitHub',
            socialUrl: '',
            order: socials.length + 1,
          },
        ];
      }
      return remaining;
    });
  };

  const updateDraft = (id: string, field: keyof SocialDraft, value: string | number | SocialPlatform) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSaveDraft = async (draft: SocialDraft) => {
    if (!draft.socialUrl.trim()) {
      onNotify('Social profile URL is required.', 'error');
      return;
    }

    setSubmittingDraftIds((prev) => new Set(prev).add(draft.id));
    try {
      const contentCollection = collection(db, 'content');
      await addDoc(contentCollection, {
        type: 'social',
        socialPlatform: draft.platform,
        socialUrl: draft.socialUrl.trim(),
        order: Number(draft.order) || 0,
        createdAt: new Date().toISOString(),
      });

      removeDraft(draft.id);
      onNotify(`Saved ${draft.platform} link to Firestore.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'content/social');
      onNotify('Failed to save social link.', 'error');
    } finally {
      setSubmittingDraftIds((prev) => {
        const next = new Set(prev);
        next.delete(draft.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'content', id));
      onNotify('Social link removed.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `content/${id}`);
      onNotify('Failed to delete social entry.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Dynamic Add New Form Block button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>CONNECTIVITY // MULTI-ENTRY REGISTRY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            Add Social Network Links
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            Connect official channels simultaneously. Supported platforms: GitHub, LinkedIn, YouTube, Instagram, Twitter/X, Other.
          </p>
        </div>

        {/* Distinct Outline "+ ADD NEW" Button */}
        <button
          type="button"
          onClick={addNewDraft}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl border-2 border-dashed border-cyan-400/60 hover:border-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] active:scale-98 min-h-[44px] touch-target"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>+ ADD NEW FORM BLOCK</span>
        </button>
      </div>

      {/* Dynamic Form Draft Blocks List */}
      <div className="space-y-6">
        {drafts.map((draft, draftIdx) => {
          const isSubmitting = submittingDraftIds.has(draft.id);

          return (
            <div
              key={draft.id}
              className="glass-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-cyan-500/20 relative"
            >
              {/* Draft Block Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                    {draftIdx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {draft.platform} Link Draft #{draftIdx + 1}
                  </h3>
                </div>

                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    className="text-xs font-mono text-neutral-400 hover:text-red-400 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove this draft block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDraft(draft);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Platform *
                    </label>
                    <select
                      value={draft.platform}
                      onChange={(e) => updateDraft(draft.id, 'platform', e.target.value as SocialPlatform)}
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-cyan-400 focus:outline-none min-h-[44px]"
                    >
                      {supportedPlatforms.map((p) => (
                        <option key={p} value={p} className="bg-neutral-900 text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Full Profile URL *
                    </label>
                    <input
                      type="url"
                      value={draft.socialUrl}
                      onChange={(e) => updateDraft(draft.id, 'socialUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-cyan-400 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={draft.order}
                    onChange={(e) => updateDraft(draft.id, 'order', Number(e.target.value))}
                    className="w-full sm:w-48 px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-cyan-400 focus:outline-none font-mono min-h-[44px]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Primary Solid Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] active:scale-98 disabled:opacity-50 min-h-[48px] touch-target"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>SAVING LINK...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>SAVE SOCIAL LINK</span>
                      </>
                    )}
                  </button>

                  {/* Append Another Block Quick Button */}
                  <button
                    type="button"
                    onClick={addNewDraft}
                    className="px-4 py-3 rounded-2xl border border-cyan-400/40 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ADD ANOTHER DRAFT</span>
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      {/* Real-time List */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-400 px-1">
          REGISTERED SOCIAL CHANNELS ({socials.length})
        </h3>

        {socials.length === 0 ? (
          <div className="p-8 rounded-3xl glass-surface-subtle text-center text-xs font-mono text-neutral-400">
            NO SOCIAL CHANNELS CONFIGURED YET.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socials.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-3xl glass-surface flex items-center justify-between gap-4 shadow-lg hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                      {s.socialPlatform}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-300 truncate max-w-xs">{s.socialUrl}</div>
                </div>

                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono border border-red-800/40 transition-all flex items-center gap-1 cursor-pointer shrink-0 min-h-[40px] touch-target"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Resume Tab Component (Singleton)
// ---------------------------------------------------------------------------
function ResumeAdminTab({
  initialResume,
  onNotify,
}: {
  initialResume: { id?: string; resumeUrl: string } | null;
  onNotify: (text: string, type: 'success' | 'error') => void;
}) {
  const [resumeUrl, setResumeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialResume?.resumeUrl) {
      setResumeUrl(initialResume.resumeUrl);
    }
  }, [initialResume]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl.trim()) {
      onNotify('Resume URL is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const docId = initialResume?.id || 'main-resume';
      const resumeDocRef = doc(db, 'content', docId);

      await setDoc(
        resumeDocRef,
        {
          type: 'resume',
          resumeUrl: resumeUrl.trim(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      onNotify('Resume singleton link saved to Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'content/resume');
      onNotify('Failed to save resume document.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!initialResume?.id) {
      setResumeUrl('');
      return;
    }
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'content', initialResume.id));
      setResumeUrl('');
      onNotify('Resume link removed from Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `content/${initialResume.id}`);
      onNotify('Failed to clear resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-surface rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl border border-white/10">
      <div>
        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>CREDENTIALS // CURRICULUM VITAE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
          Curriculum Vitae / Resume Link
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
          Set the public destination URL for your resume document (Google Drive, cloud PDF, etc.).
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
            Resume Document URL
          </label>
          <input
            id="resume-url-input"
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
            className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 min-h-[44px]"
          />
        </div>

        {resumeUrl.trim() && (
          <div className="p-4 rounded-2xl glass-surface-subtle flex items-center justify-between gap-4 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div className="text-xs text-neutral-300 truncate max-w-sm">{resumeUrl}</div>
            </div>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-surface hover:border-emerald-400 text-emerald-300 text-xs font-mono transition-all min-h-[40px] touch-target hover:shadow-[0_0_15px_rgba(52,211,153,0.25)]"
            >
              <span>Preview Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(52,211,153,0.35)] active:scale-98 disabled:opacity-50 min-h-[48px] touch-target"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span>SAVE RESUME LINK</span>
              </>
            )}
          </button>

          {initialResume?.resumeUrl && (
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="px-4 py-3.5 rounded-2xl glass-surface-subtle hover:bg-red-950/40 hover:border-red-800/50 text-neutral-400 hover:text-red-400 text-xs font-mono font-medium transition-all cursor-pointer min-h-[48px] touch-target"
            >
              CLEAR / HIDE RESUME
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
