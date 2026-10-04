import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Rocket } from 'lucide-react';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent }: NavbarProps) {
  const location = useLocation();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">AI Build League</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/leaderboard" className="btn-ghost text-sm">
              <Trophy size={15} />
              Leaderboard
            </Link>
            <Link to="/projects" className="btn-ghost text-sm">Projects</Link>
            <Link to="/club" className="btn-ghost text-sm">For Clubs</Link>
            <Link to="/admin" className="btn-ghost text-sm">Admin</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">
              Login
            </Link>
            <Link to="/join" className="btn-primary text-sm py-2 px-4">
              Join League
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
