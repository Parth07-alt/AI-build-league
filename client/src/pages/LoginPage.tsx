import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getStudentByEmail } from '../services/api';
import Navbar from '../components/Navbar';
import { Rocket, ArrowRight } from 'lucide-react';
import { toast } from '../components/ui/Toaster';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await getStudentByEmail(email);
      toast('Welcome back! Taking you to your dashboard.', 'success');
      navigate(`/dashboard/${res.data.id}`);
    } catch (err: any) {
      toast(err.response?.data?.error || 'No student registered with this email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-hero">
              <Rocket size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Access your student dashboard</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base"
              >
                {loading ? 'Finding account...' : 'Access Dashboard'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Haven't registered yet?{' '}
              <Link to="/join" className="text-brand-600 font-semibold hover:underline">
                Join the League
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
