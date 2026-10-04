import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjectWall, voteForProject, shareProject } from '../services/api';
import { Heart, Share2, ExternalLink, Filter, Clock, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { toast } from '../components/ui/Toaster';

const PROJECT_ICONS: Record<string, string> = {
  'AI Resume Analyzer': '📄', 'College FAQ Bot': '🤖',
  'AI Study Assistant': '📚', 'AI Expense Analyzer': '💸', 'Customer Support Assistant': '💬',
};

const FILTERS = ['All', 'AI Resume Analyzer', 'College FAQ Bot', 'AI Study Assistant', 'AI Expense Analyzer', 'Customer Support Assistant'];

export default function ProjectWall() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState<'recent' | 'popular'>('popular');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadProjects();
  }, [filter, sort]);

  const loadProjects = () => {
    setLoading(true);
    getProjectWall({
      project_type: filter === 'All' ? undefined : filter,
      sort,
    }).then(r => setProjects(r.data))
      .finally(() => setLoading(false));
  };

  const handleVote = async (studentId: string) => {
    if (votedIds.has(studentId)) {
      toast('Already voted for this project.', 'info');
      return;
    }
    try {
      const voter = `visitor_${Date.now()}_${Math.random()}`;
      const res = await voteForProject(studentId, voter);
      setProjects(prev => prev.map(p => p.id === studentId ? { ...p, votes: res.data.votes } : p));
      setVotedIds(prev => new Set([...prev, studentId]));
      toast('Vote counted! ❤️', 'success');
    } catch {
      toast('Could not vote. Try again.', 'error');
    }
  };

  const handleShare = async (project: any, platform: string) => {
    const msg = `🚀 Check out this AI project built in 60 minutes!\n\n${project.project_name} by ${project.student_name}\n${project.college_name}\n\n#AIBuildLeague #BuiltIn60`;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      navigator.clipboard.writeText(msg);
      toast('Share text copied!', 'success');
    }
    await shareProject(project.id, platform).catch(() => {});
  };

  const completedCount = projects.filter(p => p.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">

          {/* Header */}
          <div className="text-center py-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              🧪 AI Project Wall
            </h1>
            <p className="text-gray-500 text-sm mb-6">Students building real AI projects. Explore, vote, and share.</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-black text-brand-600">{projects.length}</div>
                <div className="text-gray-400 text-xs">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-600">{completedCount}</div>
                <div className="text-gray-400 text-xs">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-violet-600">{projects.reduce((s, p) => s + (p.votes || 0), 0)}</div>
                <div className="text-gray-400 text-xs">Total Votes</div>
              </div>
            </div>
            <div className="demo-banner inline-flex items-center gap-1 mt-4">
              DEMO DATA — NOT ACTUAL STUDENT PROJECTS
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex gap-1 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-200'}`}
                >
                  {f === 'All' ? '🌐 All' : `${PROJECT_ICONS[f] || '🤖'} ${f.split(' ').slice(-1)[0]}`}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {(['popular', 'recent'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {s === 'popular' ? '❤️ Popular' : '🕐 Recent'}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => (
                <div key={p.id} className="card-hover group flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{PROJECT_ICONS[p.project_name] || '🤖'}</span>
                    <span className={`badge ${p.completed ? 'badge-green' : 'badge-amber'}`}>
                      {p.completed ? <><CheckCircle size={10} /> Completed</> : 'In Progress'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">{p.project_name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{p.student_name}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-brand-100 flex items-center justify-center">🏛</span>
                        {p.college_name?.split(' ').slice(0, 2).join(' ')}
                      </span>
                      {p.completion_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {p.completion_time}m
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.skills?.split(',').slice(0, 3).map((s: string) => (
                        <span key={s} className="badge badge-brand">{s.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleVote(p.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        votedIds.has(p.id)
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-100'
                      }`}
                    >
                      <Heart size={12} className={votedIds.has(p.id) ? 'fill-red-500 text-red-500' : ''} />
                      {p.votes}
                    </button>
                    <button
                      onClick={() => handleShare(p, 'whatsapp')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100 transition-all"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                    <Link
                      to={`/passport/${p.id}`}
                      className="ml-auto flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500">No projects found for this filter.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/join" className="btn-primary">
              Build Your AI Project →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
