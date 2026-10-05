import React, { useEffect, useState } from 'react';
import { getAllStudents } from '../../services/api';
import { Users, CheckCircle, Search } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');

  useEffect(() => {
    getAllStudents()
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute unique colleges and clubs with their counts
  const collegeCounts = students.reduce((acc, s) => {
    const name = s.college_name || 'N/A';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clubCounts = students.reduce((acc, s) => {
    const name = s.club_name || 'No Club';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.college_name && s.college_name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCollege = collegeFilter === '' || (s.college_name || 'N/A') === collegeFilter;
    const matchesClub = clubFilter === '' || (s.club_name || 'No Club') === clubFilter;

    return matchesSearch && matchesCollege && matchesClub;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Participants ({filteredStudents.length})</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and filter all registered students.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Campuses</option>
            {Object.entries(collegeCounts)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([college, count]) => (
                <option key={college} value={college}>
                  {college} ({count as number})
                </option>
              ))}
          </select>

          <select
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Clubs</option>
            {Object.entries(clubCounts)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(([club, count]) => (
                <option key={club} value={club}>
                  {club} ({count as number})
                </option>
              ))}
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Campus & Club</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Referral Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading participants...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No participants found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Users size={14} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{s.college_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{s.club_name || 'No Club'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{s.project_name || 'Not Selected'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {s.project_completed ? (
                        <span className="badge badge-green gap-1.5 px-2.5 py-1">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      ) : (
                        <span className="badge badge-brand gap-1.5 px-2.5 py-1">
                          {s.registration_status || 'Registered'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {s.referral_code}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
