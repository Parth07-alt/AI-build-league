import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Users, Rocket, Share2, Code2, Zap, Award, Target, BarChart3,
  ChevronRight, Building, Bot, ArrowRight, Star, Clock, CheckCircle,
  TrendingUp, Globe, Shield
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getCollegeLeaderboard, getProjects } from '../services/api';

// Animated counter hook
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<boolean>(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress === 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const count = useCountUp(value);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-gradient number-font">{count.toLocaleString()}{suffix}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
  );
}

const PROJECTS = [
  { name: 'AI Resume Analyzer', icon: '📄', time: '60 min', skills: ['GenAI', 'Python', 'APIs'] },
  { name: 'College FAQ Bot', icon: '🤖', time: '60 min', skills: ['GenAI', 'JavaScript', 'Chatbots'] },
  { name: 'AI Study Assistant', icon: '📚', time: '60 min', skills: ['GenAI', 'NLP', 'Prompting'] },
  { name: 'AI Expense Analyzer', icon: '💸', time: '60 min', skills: ['GenAI', 'Data', 'Python'] },
  { name: 'Customer Support Bot', icon: '💬', time: '60 min', skills: ['GenAI', 'RAG', 'APIs'] },
];

const FAQS = [
  { q: 'Is this really free?', a: 'Yes. The workshop is completely free for all final-year engineering students.' },
  { q: 'Do I need AI experience?', a: 'No. This workshop is designed for beginners. You will leave with a working project regardless of prior experience.' },
  { q: 'What will I build?', a: 'You choose from 5 AI projects before the workshop. Each is designed to be completed in 60 minutes with step-by-step guidance.' },
  { q: 'What is the AI Build League?', a: 'It\'s a campus competition layer on top of the workshop. Your college competes against others on registrations, attendance, project completions, and sharing.' },
  { q: 'What is the Project Passport?', a: 'After completing your project, you receive a shareable digital card — the Project Passport — that you can post on LinkedIn or WhatsApp.' },
  { q: 'How does the ₹2,000 reward work?', a: 'The reward pool is distributed across the winning campus, winning club, top student builder, and most improved campus. Illustrative — subject to organizer policy.' },
  { q: 'Can my club partner with the league?', a: 'Yes! Visit the "For Clubs" page to become an AI Build League Partner and get your club\'s Campaign Kit.' },
];

export default function LandingPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCollegeLeaderboard().then(r => setLeaderboard(r.data.slice(0, 5)));
  }, []);

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-6">
                <Zap size={12} className="text-brand-600" />
                FREE ONLINE WORKSHOP · 7-DAY CAMPUS CHALLENGE
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Build Your First<br />
                <span className="text-gradient">AI Project</span><br />
                in 60 Minutes.
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                Don't just attend another AI webinar. Build something real, compete with your campus, and leave with a project you can showcase on LinkedIn.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/join" className="btn-primary text-base px-8 py-3">
                  Join the AI Build League
                  <ArrowRight size={18} />
                </Link>
                <Link to="/leaderboard" className="btn-secondary text-base px-6 py-3">
                  <Trophy size={18} />
                  View Campus League
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5"><CheckCircle size={15} className="text-emerald-500" /> No experience needed</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={15} className="text-emerald-500" /> Free certificate</div>
                <div className="flex items-center gap-1.5"><CheckCircle size={15} className="text-emerald-500" /> Real project</div>
              </div>
            </div>

            {/* Right: Live Leaderboard Preview */}
            <div className="animate-slide-up">
              <div className="card border-gray-200 shadow-hero p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" />
                      AI Campus League
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Live leaderboard · Demo data</div>
                  </div>
                  <div className="badge badge-green">Live</div>
                </div>

                {/* Top 3 podium */}
                {top3.length > 0 && (
                  <div className="flex items-end gap-3 mb-4">
                    {/* #2 */}
                    {top3[1] && (
                      <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <div className="text-lg font-black text-gray-400 mb-1">#2</div>
                        <div className="font-bold text-gray-700 text-sm leading-tight">{top3[1].name?.split(' ')[0]}</div>
                        <div className="text-xs text-gray-400 mt-1">{top3[1].registrations} builders</div>
                        <div className="text-xs font-semibold text-gray-500 mt-1">Score: {top3[1].growth_score}</div>
                      </div>
                    )}
                    {/* #1 */}
                    {top3[0] && (
                      <div className="flex-1 bg-gradient-to-b from-amber-50 to-yellow-50 rounded-xl p-4 text-center border border-amber-200 shadow-md -mt-3">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-xs font-bold text-amber-600 mb-1">#1</div>
                        <div className="font-bold text-gray-800 text-sm leading-tight">{top3[0].name?.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500 mt-1">{top3[0].registrations} builders</div>
                        <div className="text-xs font-semibold text-amber-600 mt-1">Score: {top3[0].growth_score}</div>
                      </div>
                    )}
                    {/* #3 */}
                    {top3[2] && (
                      <div className="flex-1 bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                        <div className="text-lg font-black text-orange-400 mb-1">#3</div>
                        <div className="font-bold text-gray-700 text-sm leading-tight">{top3[2].name?.split(' ')[0]}</div>
                        <div className="text-xs text-gray-400 mt-1">{top3[2].registrations} builders</div>
                        <div className="text-xs font-semibold text-orange-500 mt-1">Score: {top3[2].growth_score}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ranks 4-5 */}
                <div className="space-y-2">
                  {leaderboard.slice(3, 5).map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400 w-5">#{i + 4}</span>
                        <span className="text-sm font-medium text-gray-700">{c.name?.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-brand-600">{c.registrations}</span>
                        <span className="text-xs text-gray-400 ml-1">builders</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/leaderboard" className="mt-4 flex items-center justify-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700">
                  View full leaderboard <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-brand-600 to-violet-600 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value={416} label="Builders Registered" />
            <StatCard value={10} label="Campuses Competing" />
            <StatCard value={220} label="Projects Completed" />
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white number-font">₹2,000</div>
              <div className="text-white/70 text-sm mt-1">Reward Pool</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento: Build, Compete, Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Three reasons to join</h2>
            <p className="text-gray-500 max-w-lg mx-auto">The AI Build League is built around a growth loop that gives every student a reason to participate — and share.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="card border-brand-100 bg-gradient-to-br from-brand-50 to-indigo-50 p-8">
              <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-5">
                <Code2 size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">BUILD</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Choose a project before the workshop. Build it in 60 minutes with expert guidance. Walk away with working code.</p>
              <div className="mt-5 space-y-1.5">
                {PROJECTS.slice(0, 3).map(p => (
                  <div key={p.name} className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{p.icon}</span><span>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-8">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-5">
                <Trophy size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">COMPETE</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Your college competes against others on a live Growth Score — not just registration count. Attendance, completions, shares all matter.</p>
              <div className="mt-5 space-y-2">
                {['Registrations 30%', 'Attendance 25%', 'Completions 25%', 'Sharing 10%', 'Community 10%'].map(s => (
                  <div key={s} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-8">
              <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center mb-5">
                <Share2 size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">SHOWCASE</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Get a Project Passport after completing your project. Share it on LinkedIn, WhatsApp, or anywhere. Appear on the public AI Project Wall.</p>
              <div className="mt-5 bg-white/60 rounded-xl p-3 border border-violet-100">
                <div className="text-xs font-bold text-gray-700">#BuiltIn60</div>
                <div className="text-xs text-gray-500 mt-1">AI Resume Analyzer · 58 min · RIT Bangalore</div>
                <div className="flex gap-1 mt-2">
                  {['GenAI', 'Python'].map(s => <span key={s} className="badge badge-violet text-xs">{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">What will you build?</h2>
            <p className="text-gray-500">Pick your project before the workshop. Your reminder will be tailored to your choice.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROJECTS.map((p, i) => (
              <div key={p.name} className="card-hover cursor-pointer group" onClick={() => navigate('/join')}>
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <Clock size={12} />
                  <span>{p.time}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.skills.map(s => <span key={s} className="badge badge-brand">{s}</span>)}
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Choose this project <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/join" className="btn-primary">
              Choose My Project
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">How the League works</h2>
            <p className="text-gray-500">A growth loop designed to turn campus communities into distribution engines.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gray-200 -translate-x-1/2" />
            <div className="space-y-8">
              {[
                { icon: Users, title: 'Clubs partner with AI Build League', desc: 'Student clubs become official partners and get a campaign kit, club link, and leaderboard position.', side: 'left' },
                { icon: Share2, title: 'Clubs distribute to their community', desc: 'Each club gets ready-made WhatsApp messages, Instagram captions, and LinkedIn posts — no effort needed.', side: 'right' },
                { icon: Target, title: 'Students register and pick projects', desc: 'Students register in under 2 minutes, select their AI project, join or create a squad, and get their referral code.', side: 'left' },
                { icon: Code2, title: 'Students build in 60 minutes', desc: 'At the workshop, students build their chosen AI project with step-by-step guidance from NxtWave instructors.', side: 'right' },
                { icon: Award, title: 'Project Passport is generated', desc: 'Students get a shareable Project Passport — a digital card designed for LinkedIn screenshots and WhatsApp shares.', side: 'left' },
                { icon: TrendingUp, title: 'Campus score rises, community re-engages', desc: 'Every share brings new registrations. Campus rank climbs. Club recognition grows. The loop continues.', side: 'right' },
              ].map((step, i) => (
                <div key={step.title} className={`flex items-start gap-6 ${step.side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${step.side === 'right' ? 'md:text-right' : ''}`}>
                    <div className={`card-hover max-w-sm ${step.side === 'right' ? 'md:ml-auto' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                          <step.icon size={18} className="text-brand-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm mb-1">{step.title}</div>
                          <div className="text-gray-500 text-xs leading-relaxed">{step.desc}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex w-10 h-10 bg-brand-600 rounded-full text-white font-bold text-sm items-center justify-center shrink-0 z-10 shadow-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Clubs */}
      <section className="py-20 bg-gradient-to-br from-brand-950 to-violet-950 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge badge-brand bg-white/10 text-white border-white/20 mb-5">For Student Clubs</div>
              <h2 className="text-3xl font-black mb-4">Become an AI Build League Campus Partner</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-6">Your club gets a profile page, leaderboard position, club-specific registration link, and a complete Campaign Kit — ready-made content for WhatsApp, Instagram, and LinkedIn.</p>
              <div className="space-y-3 mb-8">
                {['AI Build League Partner Badge', 'Club Leaderboard Position', 'Club-Specific Registration Link', 'Campaign Kit (WhatsApp, Instagram, LinkedIn)', 'Performance Dashboard', 'Digital Recognition Certificate'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                    {b}
                  </div>
                ))}
              </div>
              <Link to="/club" className="btn-primary bg-white text-brand-700 hover:bg-gray-100">
                Partner Your Club
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs text-white/50 mb-3 font-medium uppercase tracking-wide">Example Campaign Kit</div>
              <div className="bg-white/10 rounded-xl p-4 text-sm text-white/80 leading-relaxed font-mono text-xs">
                {`🚀 RIT Coding Club is joining the AI Build League.

Build your first AI project in 60 minutes.

Help RIT climb the campus leaderboard.

🎯 Register FREE: [club link]`}
              </div>
              <div className="flex gap-2 mt-3">
                <div className="badge bg-white/10 text-white/60">WhatsApp Ready</div>
                <div className="badge bg-white/10 text-white/60">One Click Copy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card border-gray-100 cursor-pointer" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${faqOpen === i ? 'rotate-90' : ''}`} />
                </div>
                {faqOpen === i && (
                  <p className="mt-3 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-violet-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-5xl mb-5">🚀</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to build your first AI project?</h2>
          <p className="text-white/80 mb-8 text-lg">Join 416 students already competing. Your campus needs you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/join" className="bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm">
              Join the AI Build League
              <ArrowRight size={16} />
            </Link>
            <Link to="/projects" className="bg-white/10 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-sm">
              View Project Wall
            </Link>
          </div>
          <p className="text-white/50 text-xs mt-6">Free. Online. 60 minutes. Real AI project.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Rocket size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">AI Build League</span>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Built as a growth strategy prototype for the NxtWave Growth Intern Challenge. · All data is illustrative demo data.
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link to="/admin" className="hover:text-gray-600">Admin</Link>
              <Link to="/leaderboard" className="hover:text-gray-600">Leaderboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
