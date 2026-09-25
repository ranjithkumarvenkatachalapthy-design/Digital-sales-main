import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & status states
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Please enter your email.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setServerError(result.error || 'Invalid email or password.');
      }
    } catch {
      setServerError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('admin@admin.com');
    setPassword('admin');
    setErrors({});
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-100">
      {/* Background architectural grid pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none opacity-60"
        aria-hidden="true"
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-900/10 mb-4">
            <Store className="w-7 h-7 text-indigo-400 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            DigitalSales
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">
            Inventory • Billing • Sales Analytics
          </p>
        </div>

        {/* Login Card */}
        <Card className="mt-7 shadow-md border-slate-200/80 bg-white">
          <CardContent className="p-7 sm:p-9">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to access your business management terminal.
              </p>
            </div>

            {/* Invalid Credentials / Error Alert */}
            {serverError && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
              {/* Email / Username field */}
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  if (serverError) setServerError(null);
                }}
                error={errors.email}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                required
                autoComplete="email"
                disabled={isSubmitting}
              />

              {/* Password field with show/hide toggle */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (serverError) setServerError(null);
                }}
                error={errors.password}
                icon={<Lock className="w-4 h-4 text-slate-400" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
                autoComplete="current-password"
                disabled={isSubmitting}
              />

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 transition-colors cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isSubmitting}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Demo Credentials</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    admin@admin.com / admin
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 px-2.5 py-1 rounded border border-indigo-200 transition-colors cursor-pointer"
                >
                  Auto Fill
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer credit */}
        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Base Foundation • Member 1</span>
        </p>
      </div>

      {/* Forgot Password Modal (No OTP, No Email Sending) */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 relative animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Password Recovery
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Password recovery will be available in a future version.
            </p>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

