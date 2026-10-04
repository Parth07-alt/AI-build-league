import React, { useEffect, useState } from 'react';
import { getDashboardClubs } from '../../services/api';
import { Users, Building } from 'lucide-react';

export default function AdminClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardClubs().then(r => setClubs(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Club Performance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Distribution partners driving acquisition.</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Club</th>
                <th className="px-6 py-4">Campus</th>
                <th className="px-6 py-4 text-right">Registrations</th>
                <th className="px-6 py-4 text-right">Completions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clubs.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-indigo-600" />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {c.name}
                        {i === 0 && <span className="badge badge-amber text-[10px]">#1</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Building size={12} />
                      {c.college_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{c.registrations}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">{c.completions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
