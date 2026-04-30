import { useEffect, useState } from 'react';
import { AlertTriangle, ClipboardList, LogOut, PlusCircle, TimerReset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const summaryIcons = {
  totalTasks: ClipboardList,
  pendingTasks: TimerReset,
  overdueTasks: AlertTriangle,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState({ totalTasks: 0, pendingTasks: 0, overdueTasks: 0 });
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [summaryResponse, projectResponse] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/projects'),
      ]);

      setSummary(summaryResponse.data.summary);
      setProjects(projectResponse.data.projects);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      setError('Project name must be at least 2 characters');
      return;
    }

    if (form.description.trim().length < 10) {
      setError('Project description must be at least 10 characters');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not create project');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-white/10 bg-panel/70 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Team Task Manager</p>
              <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-300">
                Signed in as {user?.name} · {user?.role} · ID: {user?.id}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          {Object.entries(summary).map(([key, value]) => {
            const Icon = summaryIcons[key];
            return (
              <div key={key} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-glow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="mt-3 text-4xl font-semibold">{loading ? '...' : value}</p>
                  </div>
                  <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Projects</h2>
                <p className="mt-1 text-sm text-slate-300">Open a project to inspect tasks and members.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {projects.map((project) => (
                <article key={project._id} className="rounded-[1.75rem] border border-white/10 bg-panel/80 p-5 shadow-glow">
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{project.description}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                          {project.members?.length || 0} members
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem('activeProjectId', project._id);
                        navigate('/project', { state: { projectId: project._id } });
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
                    >
                      <PlusCircle className="h-4 w-4" />
                      View Project
                    </button>
                  </div>
                </article>
              ))}

              {!loading && projects.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-300 lg:col-span-2">
                  No projects yet. Admins can create one from the panel on the right.
                </div>
              ) : null}
            </div>
          </div>

          {user?.role === 'Admin' ? (
            <aside className="rounded-[1.75rem] border border-white/10 bg-panel/70 p-5 shadow-glow">
              <h2 className="text-2xl font-semibold text-white">Create Project</h2>
              <p className="mt-1 text-sm text-slate-300">Admins can add and manage projects from here.</p>

              <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Project name</span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleProjectChange}
                    placeholder="Website Redesign"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Description</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleProjectChange}
                    placeholder="Define the scope, milestones, and delivery expectations."
                    rows="5"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                  />
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-orange-400 px-4 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Create Project'}
                </button>
              </form>
            </aside>
          ) : (
            <aside className="rounded-[1.75rem] border border-white/10 bg-panel/70 p-5 shadow-glow">
              <h2 className="text-2xl font-semibold text-white">Member view</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                You can view assigned projects and update task status inside each project.
              </p>
            </aside>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
