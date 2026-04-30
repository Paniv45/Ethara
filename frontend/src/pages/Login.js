import { useState } from 'react';
import { ShieldCheck, Sparkles, UserRoundPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'Member',
};

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (mode === 'register' && form.name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }

    if (!form.email.includes('@')) {
      return 'Enter a valid email address';
    }

    if (form.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }

      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-glow backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex flex-col justify-between gap-10 overflow-hidden bg-gradient-to-br from-sky-500/20 via-bg to-orange-500/15 p-8 lg:p-12">
          <div className="absolute left-[-6rem] top-[-6rem] h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-[-4rem] right-[-3rem] h-56 w-56 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <Sparkles className="h-4 w-4 text-sky-300" />
            Team Task Manager
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Track work, assign responsibility, and keep delivery moving.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              A role-aware workspace for admins and members. Manage projects, monitor task status, and surface the work that needs attention.
            </p>
          </div>

          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            {[
              ['RBAC', 'Admin and member flows are enforced in the API and UI.'],
              ['Task visibility', 'Only assigned or accessible projects show up per user.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-panel/70 p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-panel/60 p-6 sm:p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-bg/90 p-6 shadow-glow sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {mode === 'login' ? 'Sign in to continue.' : 'Register to start managing tasks.'}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
                {mode === 'login' ? <ShieldCheck className="h-6 w-6" /> : <UserRoundPlus className="h-6 w-6" />}
              </div>
            </div>

            <div className="mt-6 flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {['login', 'register'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError('');
                  }}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === item ? 'bg-sky-400 text-bg' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {mode === 'register' ? (
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                />
              </label>

              {mode === 'register' ? (
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Role</span>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
              ) : null}

            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-orange-400 px-4 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Use the register tab to create a demo admin or member account.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
