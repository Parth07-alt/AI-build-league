import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Code2, Trophy, Rocket, CheckCircle, Users, Clock, Building } from 'lucide-react';
import { getColleges, getClubs, getProjects, registerStudent, validateReferral } from '../services/api';
import { toast } from '../components/ui/Toaster';
import Navbar from '../components/Navbar';

const STEPS = ['Project', 'College & Club', 'Your Details', 'Done!'];

const PROJECT_ICONS: Record<string, string> = {
  'AI Resume Analyzer': '📄',
  'College FAQ Bot': '🤖',
  'AI Study Assistant': '📚',
  'AI Expense Analyzer': '💸',
  'Customer Support Assistant': '💬',
};

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data
  const [projects, setProjects] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);

  // Form state
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [referrerInfo, setReferrerInfo] = useState<any>(null);

  // Result
  const [registeredStudent, setRegisteredStudent] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([getProjects(), getColleges()]).then(([pr, cr]) => {
      setProjects(pr.data);
      setColleges(cr.data);
    });
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      getClubs(selectedCollege).then(r => setClubs(r.data));
    }
  }, [selectedCollege]);

  useEffect(() => {
    if (referralCode && referralCode.length > 3) {
      validateReferral(referralCode).then(r => setReferrerInfo(r.data)).catch(() => setReferrerInfo(null));
    }
  }, [referralCode]);

  // Pre-select college from URL param
  useEffect(() => {
    const campusParam = searchParams.get('campus');
    if (campusParam && colleges.length > 0) {
      const found = colleges.find(c => c.name.toLowerCase().includes(campusParam.toLowerCase()));
      if (found) setSelectedCollege(found.id);
    }
  }, [searchParams, colleges]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (step === 0 && !selectedProject) errs.project = 'Please select a project to build.';
    if (step === 1) {
      if (!selectedCollege) errs.college = 'Please select your college.';
    }
    if (step === 2) {
      if (!name.trim()) errs.name = 'Please enter your name.';
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < 2) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const source = searchParams.get('utm_source') || (referralCode ? 'referral' : searchParams.get('club') ? 'club_link' : 'organic');
      const medium = searchParams.get('utm_medium') || 'direct';
      const campaign = searchParams.get('utm_campaign') || 'ai-build-league';

      const res = await registerStudent({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        branch,
        graduation_year: 2025,
        college_id: selectedCollege,
        club_id: selectedClub || null,
        project_id: selectedProject?.id,
        referred_by: referralCode || null,
        source,
        medium,
        campaign,
      });

      setRegisteredStudent(res.data.student);
      setStep(3);
      toast('Welcome to the AI Build League! 🚀', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedCollegeData = colleges.find(c => c.id === selectedCollege);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full mb-3">
              <Rocket size={12} />
              JOIN THE AI BUILD LEAGUE
            </div>
            <h1 className="text-2xl font-black text-gray-900">Build Your First AI Project</h1>
            <p className="text-gray-500 text-sm mt-1">In 60 minutes. For free. With your campus.</p>
          </div>

          {/* Referrer banner */}
          {referrerInfo?.referrer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-emerald-800">Invited by {referrerInfo.referrer.name}</div>
                <div className="text-xs text-emerald-600">{referrerInfo.referrer.college_name}</div>
              </div>
            </div>
          )}

          {/* Progress */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-8">
              {STEPS.slice(0, 3).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 ${i <= step ? 'text-brand-700' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i < step ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{s}</span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* STEP 0: Select Project */}
          {step === 0 && (
            <div>
              <div className="card mb-4">
                <h2 className="font-bold text-gray-900 mb-1">What do you want to build?</h2>
                <p className="text-xs text-gray-500 mb-5">Choose your project. Your workshop experience will be tailored to it.</p>
                <div className="space-y-3">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedProject?.id === p.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-100 bg-gray-50 hover:border-brand-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{PROJECT_ICONS[p.name] || '🤖'}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.description}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{p.estimated_minutes} min</span>
                            <div className="flex gap-1">
                              {p.skills?.split(',').slice(0, 3).map((s: string) => (
                                <span key={s} className="badge badge-brand text-xs">{s.trim()}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {selectedProject?.id === p.id && <CheckCircle size={18} className="text-brand-600 shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.project && <p className="text-red-500 text-xs mt-2">{errors.project}</p>}
              </div>
            </div>
          )}

          {/* STEP 1: College & Club */}
          {step === 1 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-1">Your campus</h2>
              <p className="text-xs text-gray-500 mb-5">Your registrations contribute to your campus Growth Score.</p>

              <div className="space-y-4">
                <div>
                  <label className="label">College *</label>
                  <select
                    className="input"
                    value={selectedCollege}
                    onChange={e => { setSelectedCollege(e.target.value); setSelectedClub(''); }}
                  >
                    <option value="">Select your college</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name} · {c.city}</option>)}
                  </select>
                  {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
                </div>

                {selectedCollege && clubs.length > 0 && (
                  <div>
                    <label className="label">Student Club <span className="text-gray-400">(optional but helps your club rank)</span></label>
                    <select className="input" value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
                      <option value="">Select your club</option>
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {selectedCollegeData && (
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-800">
                      <Building size={14} />
                      {selectedCollegeData.name}
                    </div>
                    <p className="text-xs text-brand-600 mt-1">Your registration will count toward this campus's Growth Score.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Personal Details */}
          {step === 2 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-1">Almost there!</h2>
              <p className="text-xs text-gray-500 mb-5">We need a few details to register you.</p>

              <div className="space-y-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input className="input" type="email" placeholder="rahul@college.edu" value={email} onChange={e => setEmail(e.target.value)} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="label">Branch / Department</label>
                  <select className="input" value={branch} onChange={e => setBranch(e.target.value)}>
                    <option value="">Select branch</option>
                    {['Computer Science', 'Information Science', 'Electronics', 'Mechanical', 'Civil', 'Other'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Referral Code <span className="text-gray-400">(optional)</span></label>
                  <input className="input" placeholder="RAHUL-AI7X" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} />
                  {referrerInfo?.referrer && (
                    <p className="text-emerald-600 text-xs mt-1">✓ Referred by {referrerInfo.referrer.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Done */}
          {step === 3 && registeredStudent && (
            <div className="text-center">
              <div className="card mb-5 text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">You're in!</h2>
                <p className="text-gray-500 text-sm mb-6">Welcome to the AI Build League, {registeredStudent.name?.split(' ')[0]}.</p>

                <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5 text-left">
                  <div className="text-xs font-semibold text-brand-700 mb-3">Your Registration</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Project</span><span className="font-semibold text-gray-900">{selectedProject?.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Campus</span><span className="font-semibold text-gray-900">{registeredStudent.college_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Referral Code</span><span className="font-mono font-bold text-brand-600">{registeredStudent.referral_code}</span></div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5 text-left">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
                    <Trophy size={14} />
                    Help your campus reach #1
                  </div>
                  <p className="text-xs text-amber-600">Share your referral link to bring more builders from {registeredStudent.college_name} and boost the campus score.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/${registeredStudent.id}`)}
                    className="btn-primary w-full justify-center"
                  >
                    View My Dashboard
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="btn-secondary w-full justify-center text-sm"
                  >
                    <Trophy size={14} />
                    View Campus Leaderboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center gap-3 mt-5">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-shrink-0">
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-primary flex-1 justify-center"
              >
                {loading ? 'Registering...' : step === 2 ? 'Complete Registration' : 'Continue'}
                {!loading && <ChevronRight size={16} />}
              </button>
            </div>
          )}

          {step < 3 && (
            <p className="text-center text-xs text-gray-400 mt-4">Free. No credit card. No spam.</p>
          )}
        </div>
      </div>
    </div>
  );
}
