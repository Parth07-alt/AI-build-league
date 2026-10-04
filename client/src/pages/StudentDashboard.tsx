import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Share2, Users, Code2, Rocket, Copy, CheckCircle,
  ChevronRight, ExternalLink, ArrowUpRight, Target, Clock, Award
} from 'lucide-react';
import { getStudent, getStudentReferrals, getCollegeLeaderboard } from '../services/api';
import { toast } from '../components/ui/Toaster';
import Navbar from '../components/Navbar';

const PROJECT_ICONS: Record<string, string> = {
  'AI Resume Analyzer': '📄', 'College FAQ Bot': '🤖',
  'AI Study Assistant': '📚', 'AI Expense Analyzer': '💸', 'Customer Support Assistant': '💬',
};

function copyToClipboard(text: string, msg = 'Copied!') {
  navigator.clipboard.writeText(text);
  toast(msg, 'success');
}

function ProgressBar({ value, max, color = 'brand' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StudentDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getStudent(id),
      getStudentReferrals(id),
      getCollegeLeaderboard(),
    ]).then(([sr, rr, lr]) => {
      setStudent(sr.data);
      setReferrals(rr.data);
      setLeaderboard(lr.data);
    }).catch(() => toast('Could not load dashboard.', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-100 rounded-2xl skeleton mx-auto mb-3" />
          <div className="text-sm text-gray-400">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="font-bold text-gray-900 mb-2">Student not found</h2>
          <Link to="/join" className="btn-primary mt-4">Register Now</Link>
        </div>
      </div>
    );
  }

  const collegeRankData = leaderboard.find(c => c.id === student.college_id);
  const rank = student.college_rank || collegeRankData?.rank || 'N/A';
  const topCollege = leaderboard[0];
  const buildersNeeded = topCollege && collegeRankData && rank > 1
    ? Math.max(0, topCollege.registrations - collegeRankData.registrations + 1)
    : 0;

  const referralLink = `${window.location.origin}/join?ref=${student.referral_code}`;
  const shareMsg = `🚀 I'm joining the AI Build League!\n\nBuilding an AI project in 60 minutes. Help ${student.college_name} reach #1!\n\nJoin here: ${referralLink}\n\n#AIBuildLeague #BuiltIn60`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 pt-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Welcome, {student.name?.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 text-sm mt-0.5">{student.college_name} · {student.branch}</p>
            </div>
            <Link to={`/passport/${student.id}`} className="btn-secondary text-sm">
              <Award size={15} className="text-violet-600" />
              My Passport
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Campus Rank Card */}
              <div className={`card ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={18} className="text-amber-500" />
                      <span className="font-bold text-gray-900">Campus Rank</span>
                    </div>
                    <div className="text-gray-500 text-xs">{student.college_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-gradient">#{rank}</div>
                    <div className="text-xs text-gray-400">{collegeRankData?.registrations || 0} builders</div>
                  </div>
                </div>

                {buildersNeeded > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>{buildersNeeded} builders to reach #1</span>
                      <span>Top: {topCollege?.registrations} builders</span>
                    </div>
                    <ProgressBar value={collegeRankData?.registrations || 0} max={topCollege?.registrations || 1} />
                    <p className="text-xs text-gray-500 mt-2">Share your referral link to help {student.college_name} reach #1.</p>
                  </div>
                )}
                {rank === 1 && (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                    <CheckCircle size={15} className="text-emerald-500" />
                    Your campus is #1! Keep building.
                  </div>
                )}

                <Link to="/leaderboard" className="mt-3 flex items-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700">
                  View full leaderboard <ChevronRight size={12} />
                </Link>
              </div>

              {/* Project Card */}
              <div className="card">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{PROJECT_ICONS[student.project_name] || '🤖'}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{student.project_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Your chosen project</div>
                      </div>
                      <span className={`badge ${
                        student.project_completed ? 'badge-green' :
                        student.project_started ? 'badge-brand' : 'badge-gray'
                      }`}>
                        {student.project_completed ? 'Completed ✓' : student.project_started ? 'In Progress' : 'Registered'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {student.project_skills?.split(',').map((s: string) => (
                        <span key={s} className="badge badge-brand">{s.trim()}</span>
                      ))}
                    </div>

                    {student.project_completed && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                          <CheckCircle size={14} />
                          Built in {student.completion_time} minutes!
                        </div>
                        <Link to={`/passport/${student.id}`} className="text-xs text-emerald-600 mt-1 flex items-center gap-1 hover:underline">
                          View Project Passport <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Referrals */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <Share2 size={16} className="text-brand-600" />
                      Referral Center
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Help your campus reach #1</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-brand-600">{student.referral_count}</div>
                    <div className="text-xs text-gray-400">referrals</div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-1.5">Your referral code</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono font-bold text-brand-700 text-sm">{student.referral_code}</div>
                    <button
                      onClick={() => copyToClipboard(student.referral_code, 'Code copied!')}
                      className="btn-ghost text-xs py-1 px-2"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-1.5">Your referral link</div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-600 truncate">{referralLink}</div>
                    <button
                      onClick={() => copyToClipboard(referralLink, 'Link copied!')}
                      className="btn-ghost text-xs py-1 px-2 shrink-0"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const url = `https://wa.me/?text=${encodeURIComponent(shareMsg)}`;
                      window.open(url, '_blank');
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    📱 Share on WhatsApp
                  </button>
                  <button
                    onClick={() => copyToClipboard(shareMsg, 'Message copied!')}
                    className="btn-secondary text-xs py-2 px-3 flex-1 justify-center"
                  >
                    <Copy size={12} /> Copy Message
                  </button>
                </div>

                {referrals.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Your referrals</div>
                    <div className="space-y-1.5">
                      {referrals.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{r.name}</span>
                          <span className="text-gray-400">{r.college_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Quick Stats */}
              <div className="card">
                <div className="text-sm font-bold text-gray-900 mb-4">Your Stats</div>
                <div className="space-y-3">
                  {[
                    { label: 'Status', value: student.registration_status === 'registered' ? 'Registered ✓' : student.registration_status },
                    { label: 'Attended', value: student.attended ? 'Yes ✓' : 'Not yet' },
                    { label: 'Project', value: student.project_completed ? 'Completed' : student.project_started ? 'In Progress' : 'Pending' },
                    { label: 'Referrals', value: `${student.referral_count} students` },
                    { label: 'Votes received', value: `${student.vote_count} votes` },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-semibold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Leaderboard mini */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={15} className="text-amber-500" />
                  <span className="font-bold text-gray-900 text-sm">Campus Ranks</span>
                </div>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((c, i) => (
                    <div key={c.id} className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg ${c.id === student.college_id ? 'bg-brand-50 border border-brand-100' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold w-5 text-center ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`}>#{i + 1}</span>
                        <span className={`font-medium ${c.id === student.college_id ? 'text-brand-700' : 'text-gray-700'}`}>
                          {c.name.split(' ').slice(0, 2).join(' ')}
                          {c.id === student.college_id && ' (You)'}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-500">{c.growth_score}</span>
                    </div>
                  ))}
                </div>
                <Link to="/leaderboard" className="mt-3 flex items-center justify-center gap-1 text-xs text-brand-600 font-medium">
                  Full leaderboard <ChevronRight size={12} />
                </Link>
              </div>

              {/* Passport preview */}
              <div className="card border-violet-100 bg-violet-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <Code2 size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-violet-900 text-sm">Project Passport</div>
                    <div className="text-xs text-violet-500">{student.project_completed ? 'Ready to share!' : 'After completion'}</div>
                  </div>
                </div>
                <Link to={`/passport/${student.id}`} className="w-full flex items-center justify-center gap-1 text-sm font-semibold text-violet-700 bg-violet-100 hover:bg-violet-200 py-2 rounded-lg transition-colors">
                  View Passport <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
