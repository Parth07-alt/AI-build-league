import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Users, Share2, BarChart3, Copy, ChevronRight,
  Zap, Building, Award, CheckCircle, ArrowRight
} from 'lucide-react';
import { getColleges, getClubs, getClub, generateCampaignKit, getClubLeaderboard } from '../services/api';
import { toast } from '../components/ui/Toaster';
import Navbar from '../components/Navbar';

function copyToClipboard(text: string, msg = 'Copied!') {
  navigator.clipboard.writeText(text);
  toast(msg, 'success');
}

function KitMessage({ label, content }: { label: string; content: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <button
          onClick={() => copyToClipboard(content, `${label} copied!`)}
          className="btn-ghost text-xs py-1 px-2"
        >
          <Copy size={11} /> Copy
        </button>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-line font-mono">
        {content}
      </div>
    </div>
  );
}

export default function ClubDashboard() {
  const [stage, setStage] = useState<'setup' | 'dashboard'>('setup');
  const [colleges, setColleges] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [clubData, setClubData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [kit, setKit] = useState<any>(null);
  const [generatingKit, setGeneratingKit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeKitTab, setActiveKitTab] = useState<'whatsapp' | 'instagram' | 'linkedin' | 'personal'>('whatsapp');

  useEffect(() => {
    getColleges().then(r => setColleges(r.data));
    getClubLeaderboard().then(r => setLeaderboard(r.data));
  }, []);

  useEffect(() => {
    if (selectedCollege) getClubs(selectedCollege).then(r => setClubs(r.data));
  }, [selectedCollege]);

  const handleEnterDashboard = async () => {
    if (!selectedCollege || !selectedClub) {
      toast('Please select your college and club.', 'error');
      return;
    }
    setLoading(true);
    try {
      const [clubRes] = await Promise.all([getClub(selectedClub)]);
      setClubData(clubRes.data);
      setStage('dashboard');
    } catch {
      toast('Could not load club data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKit = async () => {
    if (!clubData) return;
    setGeneratingKit(true);
    try {
      const res = await generateCampaignKit({
        college_name: clubData.college_name,
        club_name: clubData.name,
        club_id: clubData.id,
      });
      setKit(res.data);
      toast('Campaign Kit generated! 🎉', 'success');
    } catch {
      toast('Failed to generate kit.', 'error');
    } finally {
      setGeneratingKit(false);
    }
  };

  const kitTabContent: Record<string, string> = kit ? {
    whatsapp: kit.whatsapp_message,
    instagram: kit.instagram_caption,
    linkedin: kit.linkedin_post,
    personal: kit.personal_invite,
  } : {};

  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-lg mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full mb-3">
                <Award size={12} />
                AI BUILD LEAGUE CLUB PARTNER
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">Club Dashboard</h1>
              <p className="text-gray-500 text-sm">Get your club's campaign kit, leaderboard rank, and registration link.</p>
            </div>

            {/* Benefits */}
            <div className="card mb-6">
              <div className="text-sm font-bold text-gray-900 mb-4">Partner benefits</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['🏆', 'Club leaderboard position'],
                  ['🔗', 'Club-specific registration link'],
                  ['📢', 'Campaign Kit (WhatsApp, IG, LinkedIn)'],
                  ['📊', 'Performance dashboard'],
                  ['🎖️', 'AI Build League Partner badge'],
                  ['🏅', 'Digital recognition certificate'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-start gap-2 text-xs text-gray-600">
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Enter your club</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">College</label>
                  <select className="input" value={selectedCollege} onChange={e => { setSelectedCollege(e.target.value); setSelectedClub(''); }}>
                    <option value="">Select college</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {selectedCollege && clubs.length > 0 && (
                  <div>
                    <label className="label">Club</label>
                    <select className="input" value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
                      <option value="">Select club</option>
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <button onClick={handleEnterDashboard} disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? 'Loading...' : 'Enter Club Dashboard'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rank = clubData?.rank || 'N/A';
  const clubLink = `${window.location.origin}/join?club=${encodeURIComponent(clubData?.id)}&utm_source=club&utm_medium=direct&utm_campaign=ai-build-league`;
  const topClub = leaderboard[0];
  const buildersToRank1 = topClub && rank > 1 ? Math.max(0, topClub.registrations - clubData.registrations + 1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4">

          {/* Club Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="badge badge-brand">AI Build League Partner</div>
              </div>
              <h1 className="text-2xl font-black text-gray-900">{clubData?.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                <Building size={13} />
                {clubData?.college_name}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-black text-gradient">#{rank}</div>
                <div className="text-xs text-gray-400">Club Rank</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Metric cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Builders', value: clubData?.registrations, icon: Users, color: 'text-brand-600' },
                  { label: 'Attended', value: clubData?.attendance, icon: CheckCircle, color: 'text-emerald-600' },
                  { label: 'Completed', value: clubData?.projects_completed, icon: Award, color: 'text-violet-600' },
                  { label: 'Growth Score', value: clubData?.growth_score, icon: Zap, color: 'text-amber-600' },
                ].map(m => (
                  <div key={m.label} className="metric-card text-center">
                    <m.icon size={18} className={`${m.color} mx-auto mb-2`} />
                    <div className="text-2xl font-black text-gray-900">{m.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress to #1 */}
              {buildersToRank1 > 0 && (
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 text-sm">Progress to #1</span>
                    <span className="text-xs text-gray-400">{buildersToRank1} more builders needed</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((clubData.registrations / (topClub?.registrations || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                    <span>{clubData.registrations} builders</span>
                    <span>Target: {topClub?.registrations}+ builders</span>
                  </div>
                </div>
              )}

              {/* Campaign Kit Generator */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-gray-900">Campaign Kit Generator</div>
                    <div className="text-xs text-gray-500 mt-0.5">Ready-made content for WhatsApp, Instagram & LinkedIn</div>
                  </div>
                  <Zap size={18} className="text-amber-500" />
                </div>

                {!kit ? (
                  <div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-sm text-gray-600">
                      <div className="font-semibold mb-2">What you'll get:</div>
                      <div className="space-y-1 text-xs">
                        {['📱 WhatsApp message (copy & paste ready)', '📸 Instagram caption', '💼 LinkedIn post', '👋 Personal invite message', '🔗 Club registration link'].map(i => (
                          <div key={i}>{i}</div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateKit}
                      disabled={generatingKit}
                      className="btn-primary w-full justify-center"
                    >
                      {generatingKit ? 'Generating...' : '⚡ Generate Campaign Kit'}
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
                      {(['whatsapp', 'instagram', 'linkedin', 'personal'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveKitTab(tab)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeKitTab === tab ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {tab === 'whatsapp' ? '📱' : tab === 'instagram' ? '📸' : tab === 'linkedin' ? '💼' : '👋'} {tab}
                        </button>
                      ))}
                    </div>
                    <KitMessage label={activeKitTab.charAt(0).toUpperCase() + activeKitTab.slice(1)} content={kitTabContent[activeKitTab]} />
                    <button onClick={handleGenerateKit} className="btn-ghost text-xs">↺ Regenerate</button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Club Link */}
              <div className="card">
                <div className="font-bold text-gray-900 text-sm mb-3">Club Registration Link</div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-500 break-all">{clubLink}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(clubLink, 'Club link copied!')}
                  className="btn-primary w-full justify-center text-sm"
                >
                  <Copy size={14} />
                  Copy Club Link
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">Share this link with your members. Registrations track to your club.</p>
              </div>

              {/* Club Leaderboard */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={15} className="text-amber-500" />
                  <span className="font-bold text-gray-900 text-sm">Club Rankings</span>
                </div>
                <div className="space-y-2">
                  {leaderboard.slice(0, 6).map((c, i) => (
                    <div key={c.id} className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-lg ${c.id === clubData?.id ? 'bg-brand-50 border border-brand-100' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold w-5 ${i === 0 ? 'text-amber-500' : 'text-gray-400'}`}>#{i + 1}</span>
                        <div>
                          <div className={`font-medium ${c.id === clubData?.id ? 'text-brand-700' : 'text-gray-700'}`}>
                            {c.name} {c.id === clubData?.id && '👈'}
                          </div>
                          <div className="text-gray-400 text-xs">{c.college_name?.split(' ')[0]}</div>
                        </div>
                      </div>
                      <span className="font-semibold text-brand-600">{c.growth_score}</span>
                    </div>
                  ))}
                </div>
                <Link to="/leaderboard" className="mt-3 text-xs text-brand-600 flex items-center gap-1 justify-center">
                  Full leaderboard <ChevronRight size={12} />
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="font-bold text-gray-900 text-sm mb-3">Quick Actions</div>
                <div className="space-y-2">
                  <Link to="/leaderboard" className="btn-secondary w-full justify-center text-sm">
                    <Trophy size={14} />
                    View Leaderboard
                  </Link>
                  <Link to="/projects" className="btn-secondary w-full justify-center text-sm">
                    <BarChart3 size={14} />
                    Project Wall
                  </Link>
                  <Link to="/join" className="btn-ghost w-full justify-center text-sm">
                    <Users size={14} />
                    Invite Members
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
