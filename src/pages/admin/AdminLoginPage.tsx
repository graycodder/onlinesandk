import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

export const AdminLoginPage: React.FC = () => {
  const { login, isFirebaseActive } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-6">
          <Logo size="lg" />
        </Link>
        <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
          Atelier Control
        </span>
        <h2 className="font-serif text-3xl text-[#292522] font-normal">
          Administrator Sign In
        </h2>
        <p className="text-xs text-[#8A7869] mt-2">
          Authorized access to catalogue management and store settings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#E8E0D5] sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 rounded-sm fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Username or Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7869]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@sashandknot.com"
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A7869]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A7869] hover:text-[#292522]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-black transition-all shadow-md disabled:opacity-60"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Demonstration Notice */}
          {!isFirebaseActive && (
            <div className="p-3 bg-[#FAF7F2] border border-[#E8E0D5] text-[11px] text-[#8A7869] rounded-sm space-y-1">
              <span className="font-semibold text-[#292522] block">Sandbox Demo Mode Active:</span>
              <span>Use username <strong>admin</strong> and password <strong>sashandknot2026</strong> to access the admin dashboard.</span>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8A7869] hover:text-[#292522] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to customer store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
