import React, { useEffect, useState } from 'react';
import { getDashboardColleges } from '../../services/api';
import { Building, TrendingUp } from 'lucide-react';

export default function AdminCampuses() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardColleges().then(r => setColleges(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Campus Performance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tracking engagement across participating colleges.</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Campus</th>
                <th className="px-6 py-4 text-right">Registrations</th>
                <th className="px-6 py-4 text-right">Attendance</th>
                <th className="px-6 py-4 text-right">Completions</th>
                <th className="px-6 py-4 text-right">Shares</th>
                <th className="px-6 py-4 text-right">Conversion (Reg → Comp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {colleges.map((c, i) => {
                const conv = c.registrations > 0 ? Math.round((c.completions / c.registrations) * 100) : 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <Building size={14} className="text-brand-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            {c.name}
                            {i === 0 && <span className="badge badge-amber text-[10px]">#1</span>}
                          </div>
                          <div className="text-xs text-gray-500">{c.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{c.registrations}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{c.attendance}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-medium">{c.completions}</td>
                    <td className="px-6 py-4 text-right text-violet-600 font-medium">{c.shares}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-sm font-semibold text-gray-700">{conv}%</span>
                        {conv > 40 && <TrendingUp size={14} className="text-emerald-500" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
