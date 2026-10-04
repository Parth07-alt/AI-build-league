import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Target, Building, Users, FlaskConical, DollarSign,
  TrendingUp, Rocket, Menu, X, ChevronDown, List
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', icon: Target, label: 'Overview', exact: true },
  { path: '/admin/funnel', icon: TrendingUp, label: 'Funnel' },
  { path: '/admin/campuses', icon: Building, label: 'Campuses' },
  { path: '/admin/clubs', icon: Users, label: 'Clubs' },
  { path: '/admin/students', icon: List, label: 'Participants' },
  { path: '/admin/experiments', icon: FlaskConical, label: 'Experiments' },
  { path: '/admin/budget', icon: DollarSign, label: 'Budget' },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, exact: boolean = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Rocket size={15} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">AI Build League</div>
              <div className="text-xs text-gray-400">Admin</div>
            </div>
          </Link>
        </div>

        {/* Demo mode badge */}
        <div className="mx-3 mt-3">
          <div className="demo-banner text-center">⚠️ DEMO MODE</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={isActive(item.path, item.exact) ? 'sidebar-item-active' : 'sidebar-item'}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <Link to="/" className="sidebar-item text-xs">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 h-14">
          <button className="md:hidden p-2 -ml-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Growth Admin Dashboard</span>
          </div>
          <div className="demo-banner text-xs">DEMO DATA — NOT ACTUAL RESULTS</div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
