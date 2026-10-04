import React, { useEffect, useState } from 'react';
import { getDashboardFunnel } from '../../services/api';
import { ArrowDown } from 'lucide-react';

export default function AdminFunnel() {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardFunnel().then(r => setFunnel(r.data)).finally(() => setLoading(false));
  }, []);

  const maxValue = funnel.length > 0 ? funnel[0].value : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Growth Funnel</h1>
        <p className="text-sm text-gray-500 mt-0.5">Illustrative planning model — actual demo data where available.</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <div className="demo-banner">ILLUSTRATIVE PLANNING MODEL — demo data used for registered stages</div>
        </div>

        <div className="space-y-3">
          {funnel.map((stage, i) => {
            const pct = Math.round((stage.value / maxValue) * 100);
            const dropOff = i > 0 ? Math.round(((funnel[i-1].value - stage.value) / funnel[i-1].value) * 100) : 0;
            const conversion = i > 0 ? Math.round((stage.value / funnel[i-1].value) * 100) : 100;

            return (
              <div key={stage.stage}>
                <div className="flex items-center gap-4">
                  <div className="w-40 md:w-56 text-right">
                    <div className="text-sm font-semibold text-gray-700">{stage.stage}</div>
                    <div className="text-xs text-gray-400">{stage.label}</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 rounded-lg bg-gradient-to-r from-brand-500 to-violet-500 flex items-center pl-3 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      >
                        <span className="text-white font-bold text-sm whitespace-nowrap">
                          {stage.value.toLocaleString()}
                        </span>
                      </div>
                      {i > 0 && (
                        <span className={`text-xs font-semibold ${conversion > 70 ? 'text-emerald-600' : conversion > 40 ? 'text-amber-600' : 'text-red-500'}`}>
                          {conversion}% conv.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {i < funnel.length - 1 && (
                  <div className="flex justify-end md:justify-start ml-0 md:ml-60 mt-2 mb-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-44">
                      <ArrowDown size={14} className="text-gray-300" />
                      {i > 0 && dropOff > 0 && <span className="text-red-400">-{dropOff}% drop</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel Insights */}
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Funnel Analysis</h2>
        <div className="space-y-3 text-sm">
          {funnel.length > 1 && [
            {
              title: 'Reach → Registration',
              note: 'The primary goal of community outreach and club distribution.',
              metric: `${Math.round((funnel[2]?.value / funnel[0]?.value) * 100)}% of reach converts to registration`,
            },
            {
              title: 'Registration → Attendance',
              note: 'Quality registrations. Personalized reminders should improve this.',
              metric: `${Math.round((funnel[3]?.value / funnel[2]?.value) * 100)}% show-up rate`,
            },
            {
              title: 'Attendance → Completion',
              note: 'Core product metric. High completion = strong workshop design.',
              metric: `${Math.round((funnel[5]?.value / funnel[3]?.value) * 100)}% completion rate`,
            },
            {
              title: 'Completion → Sharing',
              note: 'The viral loop trigger. Sharing creates referral registrations.',
              metric: `${Math.round((funnel[6]?.value / funnel[5]?.value) * 100)}% share rate`,
            },
          ].map(insight => (
            <div key={insight.title} className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-gray-800 mb-0.5">{insight.title}</div>
              <div className="text-brand-600 font-bold text-sm mb-1">{insight.metric}</div>
              <div className="text-gray-500 text-xs">{insight.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-banner text-center">
        All funnel values above 'Registrations' are illustrative planning estimates, not actual campaign data.
      </div>
    </div>
  );
}
