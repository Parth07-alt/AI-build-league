import React, { useEffect, useState } from 'react';
import { getExperiments } from '../../services/api';
import { FlaskConical, CheckCircle2, CircleDashed } from 'lucide-react';

export default function AdminExperiments() {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiments().then(r => setExperiments(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Experiment Center</h1>
        <p className="text-sm text-gray-500 mt-0.5">Test, measure, learn. Growth hypotheses tracked here.</p>
      </div>

      <div className="demo-banner text-center mb-6">
        ILLUSTRATIVE DATA: Demonstrates growth experimentation methodology
      </div>

      <div className="space-y-4">
        {experiments.map(exp => (
          <div key={exp.id} className="card border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${exp.status === 'completed' ? 'bg-emerald-50' : 'bg-brand-50'}`}>
                  {exp.status === 'completed' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <CircleDashed size={16} className="text-brand-600 animate-spin-slow" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{exp.name}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`capitalize font-semibold ${exp.status === 'completed' ? 'text-emerald-600' : 'text-brand-600'}`}>{exp.status}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500">n = {exp.sample_size}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 mb-1">HYPOTHESIS</div>
                <div className="text-sm text-gray-700 leading-relaxed">{exp.hypothesis}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-xs font-semibold text-gray-500 mb-1">METRIC</div>
                <div className="text-sm font-medium text-brand-700">{exp.metric}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="text-[10px] font-bold tracking-wider text-gray-400 mb-1">VARIANT A</div>
                <div className="text-sm text-gray-800">{exp.variant_a}</div>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 bg-brand-50/30">
                <div className="text-[10px] font-bold tracking-wider text-brand-600 mb-1">VARIANT B</div>
                <div className="text-sm text-gray-800">{exp.variant_b}</div>
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-4 mt-2">
              <div className="text-xs font-bold text-gray-400 tracking-wider mb-2">RESULT & DECISION</div>
              <div className="text-sm text-gray-200 mb-1">{exp.result || 'Awaiting statistical significance...'}</div>
              {exp.decision && (
                <div className="text-sm font-semibold text-emerald-400 mt-2">↳ {exp.decision}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
