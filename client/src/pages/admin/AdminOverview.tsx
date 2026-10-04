import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardOverview, getDashboardChannels, getDashboardProjects, getDashboardDaily
} from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Target, Users, Trophy, Share2, TrendingUp, Zap, Building, Award } from 'lucide-react';

const CHANNEL_COLORS = ['#4f46e5', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#db2777'];

function MetricCard({ label, value, sub, icon: Icon, color = 'text-brand-600', bg = 'bg-brand-50' }: any) {
  return (
    <div className="metric-card">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={18} className={color} />
      </div>
      <div className="text-2xl font-black text-gray-900 number-font">{value?.toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminOverview() {
  const [overview, setOverview] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardOverview(),
      getDashboardChannels(),
      getDashboardProjects(),
      getDashboardDaily(),
    ]).then(([or, cr, pr, dr]) => {
      setOverview(or.data);
      setChannels(cr.data);
      setProjects(pr.data);
      setDaily(dr.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !overview) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const progressPct = Math.round((overview.registrations / overview.target) * 100);

  const channelData = channels.map((c: any, i: number) => ({
    name: c.source?.replace(/_/g, ' '),
    value: c.count,
    fill: CHANNEL_COLORS[i % CHANNEL_COLORS.length]
  }));

  const projectData = projects.map((p: any) => ({
    name: p.name.split(' ').slice(-1)[0],
    selected: p.total_selected,
    started: p.started,
    completed: p.completed,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Campaign Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI Build League · NxtWave Growth Intern Challenge</p>
      </div>

      {/* Target Progress */}
      <div className="card bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-white/70 text-xs font-semibold mb-1">REGISTRATION TARGET</div>
            <div className="text-5xl font-black">{overview.registrations.toLocaleString()}</div>
            <div className="text-white/70 text-sm">of {overview.target} target registrations</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{progressPct}%</div>
            <div className="text-white/70 text-xs">complete</div>
          </div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-2">
          <span>0</span>
          <span>Target: {overview.target}</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Qualified Registrations" value={overview.qualified_registrations} icon={Target} sub="Attended workshop" color="text-brand-600" bg="bg-brand-50" />
        <MetricCard label="Projects Completed" value={overview.projects_completed} icon={Award} color="text-violet-600" bg="bg-violet-50" />
        <MetricCard label="Referral Registrations" value={overview.referral_registrations} icon={Share2} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard label="Total Shares" value={overview.shares} icon={TrendingUp} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Key Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="metric-card flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Top Campus</div>
            <div className="font-bold text-gray-900 text-sm">{overview.top_campus}</div>
          </div>
        </div>
        <div className="metric-card flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-brand-600" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Top Club</div>
            <div className="font-bold text-gray-900 text-sm">{overview.top_club}</div>
          </div>
        </div>
        <div className="metric-card flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Best Channel</div>
            <div className="font-bold text-gray-900 text-sm capitalize">{overview.best_channel?.replace(/_/g, ' ')}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Daily registrations */}
        <div className="card">
          <div className="section-title text-base mb-4">Daily Registrations</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={d => `Date: ${d}`} />
              <Line type="monotone" dataKey="registrations" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel breakdown */}
        <div className="card">
          <div className="section-title text-base mb-4">Registrations by Source</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                  {channelData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {channelData.map((c: any) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.fill }} />
                    <span className="text-gray-600 capitalize">{c.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project intent */}
      <div className="card">
        <div className="section-title text-base mb-1">Project Intent Distribution</div>
        <div className="section-subtitle mb-4">What students want to build — useful for personalized communication</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={projectData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="selected" fill="#4f46e5" name="Selected" radius={[0, 4, 4, 0]} />
            <Bar dataKey="completed" fill="#059669" name="Completed" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
