import React, { useEffect, useState } from 'react';
import { getBudget } from '../../services/api';
import { DollarSign, AlertCircle } from 'lucide-react';

export default function AdminBudget() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBudget().then(r => setBudget(r.data)).finally(() => setLoading(false));
  }, []);

  if (!budget) return null;

  const total = budget.total || 2000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Budget Allocation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Activating distribution rather than buying traffic.</p>
      </div>

      <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-emerald-800/70 text-xs font-semibold mb-1">TOTAL BUDGET</div>
            <div className="text-4xl font-black text-emerald-700">₹{total.toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="demo-banner flex items-start gap-2">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Growth Rationale:</span> The ₹2,000 budget is too small for meaningful paid acquisition (CAC would exhaust it too quickly). Instead, this budget is structured as an incentive pool to activate existing campus communities (clubs) and turn them into distribution partners.
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Reward Category</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Growth Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {budget.items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{item.name}</td>
                <td className="px-6 py-4 font-black text-emerald-600">₹{item.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-xs text-gray-600 leading-relaxed max-w-md">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-center text-gray-400 mt-8">{budget.note}</p>
    </div>
  );
}
