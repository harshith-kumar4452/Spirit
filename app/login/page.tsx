'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/firebase/auth';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);

  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again or create an account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0A0F1A]">
      {/* Background Ambience */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-brand-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 p-8 w-full max-w-md mx-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome to <span className="text-violet-400">Gen</span><span className="text-white">Sathi</span></h1>
          <p className="text-white/60 text-sm">Report issues. Earn impact. Improve your city.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-md">
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-white placeholder-white/30 backdrop-blur-md"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-white placeholder-white/30 backdrop-blur-md"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2 ml-1">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-white placeholder-white/30 backdrop-blur-md tracking-wider"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            {!loading && <div className="absolute inset-0 h-full w-full scale-0 rounded-xl bg-white/20 transition-all duration-300 group-hover:scale-100 group-active:duration-75" />}
          </button>

          <div className="text-center mt-6 text-sm text-white/50">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="relative mb-8 flex items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium text-white/30 uppercase tracking-widest">Or Continue With</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <GoogleSignInButton />

        <p className="mt-8 text-xs text-center text-white/40 leading-relaxed">
          By signing in you agree to our <br />
          <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}
