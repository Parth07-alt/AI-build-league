import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPassport, shareProject } from '../services/api';
import { Share2, Briefcase, Copy, CheckCircle, Award, Clock, Building, Code2 } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import Navbar from '../components/Navbar';

const PROJECT_ICONS: Record<string, string> = {
  'AI Resume Analyzer': '📄', 'College FAQ Bot': '🤖',
  'AI Study Assistant': '📚', 'AI Expense Analyzer': '💸', 'Customer Support Assistant': '💬',
};

export default function PassportPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      getPassport(studentId)
        .then(r => setPassport(r.data))
        .catch(() => toast('Could not load passport.', 'error'))
        .finally(() => setLoading(false));
    }
  }, [studentId]);

  const handleShare = async (platform: string) => {
    if (!passport) return;
    const passportUrl = `${window.location.origin}/passport/${studentId}`;
    const msg = platform === 'linkedin'
      ? `🚀 Just built an AI project in 60 minutes!\n\nProject: ${passport.project_name}\nCampus: ${passport.college_name}\nSkills: ${passport.skills}\nTime: ${passport.completion_time || 60} minutes\n\n#AIBuildLeague #BuiltIn60 #GenAI\n\nView Passport: ${passportUrl}`
      : `🤖 I built ${passport.project_name} in ${passport.completion_time || 60} minutes!\n\nView my AI Project Passport: ${passportUrl}\n\n#AIBuildLeague #BuiltIn60`;

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(passportUrl)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      await navigator.clipboard.writeText(msg);
      toast('Share text copied!', 'success');
    }
    await shareProject(studentId!, platform).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="skeleton w-80 h-96 rounded-2xl" />
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-600">Passport not found.</p>
          <Link to="/join" className="btn-primary mt-4">Register Now</Link>
        </div>
      </div>
    );
  }

  const skills = passport.skills?.split(',') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-violet-950 to-indigo-950">
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm">

          {/* The Passport Card */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-brand-500 via-violet-500 to-indigo-500" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-xs font-bold tracking-[0.15em] text-gray-400 mb-0.5">AI BUILD LEAGUE</div>
                  <div className="text-xs text-gray-400">PROJECT PASSPORT</div>
                </div>
                <div className="text-3xl">{PROJECT_ICONS[passport.project_name] || '🤖'}</div>
              </div>

              {/* Student */}
              <div className="mb-5">
                <h2 className="text-2xl font-black text-gray-900">{passport.name}</h2>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Building size={13} />
                  {passport.college_name}
                </div>
                {passport.club_name && (
                  <div className="text-xs text-gray-400">{passport.club_name}</div>
                )}
              </div>

              {/* Project */}
              <div className="bg-gradient-to-br from-brand-50 to-violet-50 rounded-2xl p-5 mb-5 border border-brand-100">
                <div className="text-xs font-semibold text-brand-600 mb-2 tracking-wide">BUILT PROJECT</div>
                <div className="text-lg font-black text-gray-900 mb-3">{passport.project_name}</div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {skills.map((s: string) => (
                    <span key={s} className="badge badge-brand text-xs">{s.trim()}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-500" />
                    <span className="text-sm font-bold text-gray-700">{passport.completion_time || '60'} minutes</span>
                  </div>
                  {passport.completed && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-700">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hashtag */}
              <div className="text-center mb-5">
                <span className="text-brand-600 font-black text-xl">#BuiltIn60</span>
              </div>

              {/* Verification */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-violet-600 rounded-lg flex items-center justify-center shrink-0">
                  <Award size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-700">Built during AI Build League</div>
                  <div className="text-xs text-gray-400">Prototype completion indicator</div>
                </div>
              </div>

              {/* Share buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Briefcase size={16} />
                  Share on LinkedIn
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  📱 Share on WhatsApp
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={14} />
                  Copy Passport Link
                </button>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <Link to="/projects" className="text-white/60 text-sm hover:text-white/90 transition-colors">
              ← View Project Wall
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
