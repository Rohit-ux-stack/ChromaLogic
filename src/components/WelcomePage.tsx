import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Eye, Lock, ArrowRight, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { auth, googleProvider, isAuthorizedAdmin } from '../firebase';
import { signInWithPopup, onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { formatAuthError } from '../utils/authErrors';

export function WelcomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdminGoogleLogin = async () => {
    setLoginError(null);
    setSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      if (email && isAuthorizedAdmin(email)) {
        navigate('/vault-9x2k1');
      } else {
        setLoginError('ACCESS DENIED: Your account is not in the authorized administrator list.');
      }
    } catch (err: unknown) {
      console.error('Google Sign-In caught:', err);
      const formatted = formatAuthError(err);
      if (formatted) {
        setLoginError(formatted);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setLoginError(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleDirectAdminEnter = () => {
    if (user?.email && isAuthorizedAdmin(user.email)) {
      navigate('/vault-9x2k1');
    } else {
      handleAdminGoogleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col justify-between relative overflow-hidden selection:bg-[#00FFFF] selection:text-black">
      {/* Immersive Cyan Dot Matrix Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#00FFFF 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 md:p-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FFFF] shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white leading-tight font-serif-heading">
              ChromaLogic
            </div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              Rohit Banerjee Portfolio
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/90 shadow-sm shadow-red-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/90 shadow-sm shadow-yellow-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/90 shadow-sm shadow-green-500/40" />
        </div>
      </header>

      {/* Main Welcome Gateway Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-12 md:py-16 z-20 max-w-5xl mx-auto w-full">
        {/* Title / Intro */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-surface-subtle text-[#D96C51] text-xs font-mono tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D96C51] animate-pulse" />
            <span>ACCESS GATEWAY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight font-serif-heading">
            Welcome to ChromaLogic
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-neutral-400 font-light max-w-md mx-auto">
            Select your entry mode to continue to the verified portfolio system.
          </p>
        </div>

        {/* Auth Error Banner if present */}
        {loginError && (
          <div className="w-full max-w-2xl mb-8 p-4 rounded-2xl bg-red-950/70 border border-red-800/70 text-red-300 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/50">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="break-words">{loginError}</span>
            </div>
            {user && (
              <button
                onClick={handleSignOut}
                className="text-[11px] underline hover:text-white uppercase tracking-wider cursor-pointer min-h-[44px] flex items-center shrink-0"
              >
                Sign Out
              </button>
            )}
          </div>
        )}

        {/* 2 Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* OPTION 1: VISITOR */}
          <div
            id="welcome-option-visitor"
            className="group relative rounded-3xl glass-surface hover:border-[#00FFFF]/50 hover:bg-white/[0.09] transition-liquid p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-cyan-950/20"
          >
            <div className="space-y-5 sm:space-y-6">
              {/* Card Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-surface-subtle flex items-center justify-center text-[#00FFFF] shadow-inner group-hover:scale-105 transition-transform">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest px-3 py-1 rounded-full glass-surface-subtle">
                  PUBLIC // VIEW ONLY
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#00FFFF] transition-colors">
                  Visitor
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                  Browse the public display portfolio. View engineering projects, video demo reels, verified resume, and contact links in read-only mode.
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 sm:pt-8">
              <button
                id="enter-visitor-btn"
                type="button"
                onClick={() => navigate('/portfolio')}
                className="w-full min-h-[48px] flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all active:scale-98 shadow-md cursor-pointer touch-target"
              >
                <span>Enter as Visitor</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* OPTION 2: ADMIN */}
          <div
            id="welcome-option-admin"
            className="group relative rounded-3xl glass-surface hover:border-[#00FFFF]/50 hover:bg-white/[0.09] transition-liquid p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-cyan-950/20 overflow-hidden"
          >
            {/* Top Accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-5 sm:space-y-6">
              {/* Card Badge */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF] shadow-inner group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-[#00FFFF] uppercase tracking-widest px-3 py-1 rounded-full bg-[#00FFFF]/10 border border-[#00FFFF]/30 font-semibold">
                  RESTRICTED // ROOT
                </span>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#00FFFF] transition-colors flex items-center gap-2">
                  <span>Admin</span>
                  <Lock className="w-4 h-4 text-neutral-400" />
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                  Full edit and command access. Manage profile bio, add/delete projects, update demo videos, and upload resume documents to Firestore.
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 sm:pt-8 space-y-3">
              {user && isAuthorizedAdmin(user.email) ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Authorized as {user.email}</span>
                  </div>
                  <button
                    id="enter-admin-authenticated-btn"
                    type="button"
                    onClick={handleDirectAdminEnter}
                    className="w-full min-h-[48px] flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-[#00FFFF] hover:bg-cyan-300 text-black font-bold text-sm tracking-wide transition-all active:scale-98 shadow-lg shadow-cyan-950/50 cursor-pointer touch-target"
                  >
                    <span>Open Admin Vault</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>
              ) : (
                <button
                  id="admin-google-auth-welcome-btn"
                  type="button"
                  disabled={signingIn || authLoading}
                  onClick={handleAdminGoogleLogin}
                  className="w-full min-h-[48px] flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all active:scale-98 shadow-md cursor-pointer disabled:opacity-50 touch-target"
                >
                  {signingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-neutral-800" />
                      <span>Verifying with Google...</span>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Telemetry Footer */}
      <footer className="p-6 md:p-8 border-t border-white/10 bg-black/40 backdrop-blur-md z-20">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF]" />
            <span>FIRESTORE: CONNECTED (data-grid-4dtd0)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© 2026 Rohit Banerjee (Spyder)</span>
            <span className="text-neutral-700">|</span>
            <span className="text-[#D96C51]/90">A ChromaLogic Experience</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
