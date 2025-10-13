import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearError, loginUser } from '../store/slices/authSlice';

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch {
      // Errors handled by slice + toast
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/80">
            <LogIn className="h-4 w-4 text-brand-200" />
            Sign in
          </span>
          <h1 className="text-3xl font-heading font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-slate-300/80">
            Manage tournaments, refine brackets, and keep your community engaged.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6 border-white/10 bg-white/10">
          <div className="space-y-4">
            <label className="input-label" htmlFor="email">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-200" />
              <input
                id="email"
                type="email"
                className="input-field pl-11"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email && <p className="text-xs text-rose-300">{errors.email.message}</p>}
          </div>

          <div className="space-y-4">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-200" />
              <input
                id="password"
                type="password"
                className="input-field pl-11"
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-300">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-200 hover:text-brand-100">
              Create one for free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
