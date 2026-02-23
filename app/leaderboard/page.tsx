'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/lib/utils/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Trophy, Zap, FileText, CheckCircle } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data() as User);
        setLeaders(data);
      } catch (error) {
        console.error('Fetch leaderboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-brand-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leaderboard</h1>
          </div>
          <p className="text-sm text-slate-600">Top contributors in your community</p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {leaders.map((leader, index) => {
            const isCurrentUser = user?.uid === leader.uid;
            const rank = index + 1;

            return (
              <div
                key={leader.uid}
                className={`flex items-center gap-4 p-4 border-b border-slate-100 last:border-b-0 ${isCurrentUser ? 'bg-brand-50 border-l-4 border-l-brand-500' : ''
                  } ${rank <= 3 ? 'bg-slate-50' : ''}`}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {rank <= 3 ? (
                    <span className="text-2xl">{medals[rank - 1]}</span>
                  ) : (
                    <span className="text-lg font-bold text-slate-600">{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={leader.photoURL || '/default-avatar.png'}
                  alt={leader.displayName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-slate-200"
                />

                {/* Name and Level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {leader.displayName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-brand-600 font-normal">← YOU</span>
                      )}
                    </p>
                  </div>
                  <LevelIndicator level={leader.level} title={leader.levelTitle} />
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{leader.totalComplaints}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{leader.resolvedComplaints}</span>
                  </div>
                </div>

                {/* XP */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">{leader.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
