import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Users, Code2, Share2, Zap } from 'lucide-react';
import { getCollegeLeaderboard, getClubLeaderboard } from '../services/api';
import Navbar from '../components/Navbar';

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-sm font-bold text-gray-400 w-7 text-center">#{rank}</span>;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'campus' | 'club'>('campus');
  const [colleges, setColleges] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCollegeLeaderboard(), getClubLeaderboard()])
      .then(([cr, clr]) => {
        setColleges(cr.data);
        setClubs(clr.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = activeTab === 'campus' ? colleges.slice(0, 3) : clubs.slice(0, 3);
  const rest = activeTab === 'campus' ? colleges.slice(3) : clubs.slice(3);
  const data = activeTab === 'campus' ? colleges : clubs;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header */}
          <div className="text-center py-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full mb-3 border border-amber-200">
              <Trophy size={12} className="text-amber-500" />
              LIVE LEADERBOARD · DEMO DATA
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">AI Campus League</h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Campuses and clubs compete on a Growth Score that rewards real engagement — not just registrations.</p>
          </div>

          {/* Score formula */}
          <div className="card mb-6 text-center">
            <div className="text-xs font-semibold text-gray-500 mb-3">GROWTH SCORE FORMULA · Prototype scoring model — illustrative</div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                ['30%', 'Registrations'],
                ['25%', 'Attendance'],
                ['25%', 'Completions'],
                ['10%', 'Sharing'],
                ['10%', 'Referrals'],
              ].map(([pct, label]) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-black text-brand-600">{pct}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('campus')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'campus' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🏫 Campus League
            </button>
            <button
              onClick={() => setActiveTab('club')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'club' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              👥 Club League
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
            </div>
          ) : (
            <>
              {/* Podium Top 3 */}
              {top3.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {/* #2 */}
                  <div className="card rank-2 flex flex-col items-center text-center py-6 mt-6">
                    <Medal rank={2} />
                    <div className="font-bold text-gray-700 text-sm mt-2 leading-tight">{top3[1]?.name?.split(' ').slice(0, 2).join(' ')}</div>
                    {activeTab === 'club' && <div className="text-xs text-gray-400 mt-0.5">{top3[1]?.college_name?.split(' ')[0]}</div>}
                    <div className="text-2xl font-black text-gray-500 mt-2">{top3[1]?.growth_score}</div>
                    <div className="text-xs text-gray-400">Growth Score</div>
                    <div className="text-xs text-gray-500 mt-1">{top3[1]?.registrations} builders</div>
                  </div>

                  {/* #1 */}
                  <div className="card rank-1 flex flex-col items-center text-center py-6 shadow-md border-amber-200">
                    <Medal rank={1} />
                    <div className="font-bold text-gray-800 text-sm mt-2 leading-tight">{top3[0]?.name?.split(' ').slice(0, 2).join(' ')}</div>
                    {activeTab === 'club' && <div className="text-xs text-amber-600 mt-0.5">{top3[0]?.college_name?.split(' ')[0]}</div>}
                    <div className="text-3xl font-black text-amber-600 mt-2">{top3[0]?.growth_score}</div>
                    <div className="text-xs text-amber-500">Growth Score</div>
                    <div className="text-xs text-gray-500 mt-1">{top3[0]?.registrations} builders</div>
                  </div>

                  {/* #3 */}
                  <div className="card rank-3 flex flex-col items-center text-center py-6 mt-6">
                    <Medal rank={3} />
                    <div className="font-bold text-gray-700 text-sm mt-2 leading-tight">{top3[2]?.name?.split(' ').slice(0, 2).join(' ')}</div>
                    {activeTab === 'club' && <div className="text-xs text-gray-400 mt-0.5">{top3[2]?.college_name?.split(' ')[0]}</div>}
                    <div className="text-2xl font-black text-orange-500 mt-2">{top3[2]?.growth_score}</div>
                    <div className="text-xs text-orange-400">Growth Score</div>
                    <div className="text-xs text-gray-500 mt-1">{top3[2]?.registrations} builders</div>
                  </div>
                </div>
              )}

              {/* Full Table */}
              <div className="card overflow-hidden p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Rank</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{activeTab === 'campus' ? 'Campus' : 'Club'}</th>
                      {activeTab === 'club' && <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">College</th>}
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Builders</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Completed</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Medal rank={item.rank} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                          {activeTab === 'campus' && <div className="text-xs text-gray-400">{item.city}</div>}
                        </td>
                        {activeTab === 'club' && (
                          <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{item.college_name}</td>
                        )}
                        <td className="px-4 py-3 text-right">
                          <span className="font-semibold text-gray-700 text-sm">{item.registrations}</span>
                        </td>
                        <td className="px-4 py-3 text-right hidden md:table-cell">
                          <span className="text-sm text-gray-500">{item.projects_completed}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-brand-600 text-sm">{item.growth_score}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3">Your campus not listed? Register and help it climb.</p>
            <Link to="/join" className="btn-primary">
              Join and Boost Your Campus
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
