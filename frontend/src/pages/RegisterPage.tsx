import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearError, registerUser } from '../store/slices/authSlice';

type RegisterFormValues = {
  displayName: string;
  email: string;
  password: string;
};

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: '',
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

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard', { replace: true });
    } catch {
      // handled via slice/toast
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/80">
            <UserPlus className="h-4 w-4 text-brand-200" />
            Join the community
          </span>
          <h1 className="text-3xl font-heading font-semibold text-white">Create your organizer hub</h1>
          <p className="text-sm text-slate-300/80">
            Launch vibrant events, track stats, and bring players together in a few seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6 border-white/10 bg-white/10">
          <div className="space-y-4">
            <label className="input-label" htmlFor="displayName">
              Display name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-200" />
              <input
                id="displayName"
                type="text"
                className="input-field pl-11"
                placeholder="Your name or team"
                {...register('displayName', {
                  required: 'Display name is required',
                  minLength: { value: 2, message: 'Must be at least 2 characters' },
                })}
              />
            </div>
            {errors.displayName && <p className="text-xs text-rose-300">{errors.displayName.message}</p>}
          </div>

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
                placeholder="Create a secure password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Must be at least 6 characters' },
                })}
              />
            </div>
            {errors.password && <p className="text-xs text-rose-300">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-200 hover:text-brand-100">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
