'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

export function Navbar() {
  const { user, userData, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = userData?.role === 'admin';

  const navLinks = isAdmin
    ? [
      { href: '/admin', label: 'Home' },
      { href: '/admin/dashboard', label: 'Dashboard' },
    ]
    : [
      { href: '/dashboard', label: 'Home' },
      { href: '/status', label: 'Status' },
      { href: '/leaderboard', label: 'Leaderboard' },
    ];

  // Hide the navbar on the landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300">
      {/* Gradient top border line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-70" />

      {/* Main navbar body */}
      <div className="bg-gradient-to-r from-[#060D1F]/95 via-[#0A1628]/95 to-[#060D1F]/95 backdrop-blur-2xl border-b border-brand-500/10 shadow-[0_4px_40px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3 group">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-violet-600 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-lg tracking-tight">G</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight leading-none">
                  <span className="text-violet-400">Gen</span><span className="text-white">Sathi</span>
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-semibold text-brand-400/80 tracking-widest uppercase leading-none mt-0.5">
                    Admin
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                        }`}
                    >
                      {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-violet-500/20 rounded-lg border border-brand-500/30" />
                      )}
                      <span className="relative">{link.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right Side */}
            {user && (
              <div className="hidden md:flex items-center gap-3">
                {/* XP Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{userData?.xp || 0} XP</span>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* User Avatar + Name */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-violet-600 rounded-full blur-sm opacity-40" />
                    <img
                      src={user.photoURL || '/default-avatar.png'}
                      alt={userData?.displayName || 'User'}
                      className="relative w-9 h-9 rounded-full border-2 border-brand-500/30 object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0A1628] rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white leading-none">{userData?.displayName?.split(' ')[0]}</span>
                    <span className="text-[10px] text-white/40 leading-none mt-0.5">
                      {isAdmin ? 'Administrator' : `Level ${userData?.level || 1}`}
                    </span>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden bg-gradient-to-b from-[#0A1628] to-[#060D1F] border-b border-brand-500/10 backdrop-blur-2xl shadow-2xl absolute w-full left-0 px-4 pb-4 z-50">
          {/* Nav Links */}
          <div className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                    ? 'bg-gradient-to-r from-brand-500/20 to-violet-500/20 text-white border border-brand-500/30'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10 px-2">
            <div className="relative">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={userData?.displayName || 'User'}
                className="w-11 h-11 rounded-full border-2 border-brand-500/30"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0A1628] rounded-full" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{userData?.displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-300 font-semibold">{userData?.xp || 0} XP</span>
              </div>
            </div>
            <button
              onClick={() => { signOut(); setMobileMenuOpen(false); }}
              className="px-3 py-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
