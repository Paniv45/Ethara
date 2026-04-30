import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const ProjectView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const currentUserId = user?.id || user?._id || '';
  const projectId = location.state?.projectId || sessionStorage.getItem('activeProjectId') || '';
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Med',
    assignedTo: '',
  });
  const [projectErrors, setProjectErrors] = useState({});
  const [taskErrors, setTaskErrors] = useState({});
  const todayDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  const getAssignedUserId = (assignedTo) => {
    if (!assignedTo) {
      return '';
    }

    return (assignedTo._id || assignedTo).toString();
  };

  const isProjectMember = (memberList, userId) => {
    if (!Array.isArray(memberList) || !userId) {
      return false;
    }

    return memberList.some((member) => getAssignedUserId(member) === userId.toString());
  };

  const assignedTasksCount = tasks.filter((task) => getAssignedUserId(task.assignedTo) === currentUserId).length;

  const loadProject = async () => {
    if (!projectId) {
      setError('Project not selected. Please open a project from dashboard.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const projectResponse = await api.get(`/projects/${projectId}`);

      setProject(projectResponse.data.project);
      setTasks(projectResponse.data.tasks);
      setProjectForm({
        name: projectResponse.data.project.name,
        description: projectResponse.data.project.description,
      });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProject();
    }
  }, [projectId, user]);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      await loadProject();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      await loadProject();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete task');
    }
  };

  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setProjectErrors((current) => ({ ...current, [name]: '' }));
    setProjectForm((current) => ({ ...current, [name]: value }));
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setTaskErrors((current) => ({ ...current, [name]: '' }));
    setTaskForm((current) => ({ ...current, [name]: value }));
  };

  const handleProjectUpdate = async (event) => {
    event.preventDefault();
    setProjectErrors({});

    if (projectForm.name.trim().length < 2) {
      setProjectErrors({ name: 'Project name must be at least 2 characters' });
      return;
    }

    if (projectForm.description.trim().length < 10) {
      setProjectErrors({ description: 'Project description must be at least 10 characters' });
      return;
    }

    try {
      await api.put(`/projects/${projectId}`, projectForm);
      await loadProject();
    } catch (requestError) {
      setProjectErrors({
        submit: requestError?.response?.data?.message || 'Unable to update project',
      });
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setTaskErrors({});

    if (taskForm.title.trim().length < 2) {
      setTaskErrors({ title: 'Task title must be at least 2 characters' });
      return;
    }

    if (taskForm.description.trim().length < 10) {
      setTaskErrors({ description: 'Task description must be at least 10 characters' });
      return;
    }

    if (!taskForm.dueDate) {
      setTaskErrors({ dueDate: 'Due date is required' });
      return;
    }

    try {
      await api.post('/tasks', {
        ...taskForm,
        projectId,
        assignedTo: taskForm.assignedTo || null,
      });
      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Med',
        assignedTo: '',
      });
      await loadProject();
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to create task';

      if (message.toLowerCase().includes('assigned user id is invalid') || message.toLowerCase().includes('assigned user not found')) {
        setTaskErrors({ assignedTo: message });
        return;
      }

      setTaskErrors({ submit: message });
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${projectId}`);
      sessionStorage.removeItem('activeProjectId');
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Loading project...
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-panel/80 p-6 text-center shadow-glow">
          <p className="text-lg font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-bg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <header className="rounded-[2rem] border border-white/10 bg-panel/70 p-6 shadow-glow backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Project workspace</p>
              <h1 className="mt-2 text-3xl font-semibold">{project?.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{project?.description}</p>
              <p className="mt-4 text-sm text-slate-400">
                Created by {project?.createdBy?.name || 'Unknown'} · {project?.members?.length || 0} members
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleDeleteProject}
                  className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
                >
                  Delete Project
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <section className={isAdmin ? 'grid gap-6 xl:grid-cols-[0.95fr_1.05fr]' : 'space-y-6'}>
          <div className="space-y-6">
            {!isAdmin ? (
              <aside className="rounded-[1.75rem] border border-white/10 bg-panel/70 p-5 shadow-glow">
                <h2 className="text-2xl font-semibold text-white">Member workspace</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  You can only see tasks assigned to you in this project.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Your role</p>
                    <p className="mt-2 text-lg font-semibold text-white">Member</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Assigned tasks</p>
                    <p className="mt-2 text-lg font-semibold text-white">{assignedTasksCount}</p>
                  </div>
                </div>
              </aside>
            ) : null}

            {isAdmin ? (
              <form onSubmit={handleProjectUpdate} className="rounded-[1.75rem] border border-white/10 bg-panel/70 p-5 shadow-glow">
                <h2 className="text-2xl font-semibold text-white">Edit Project</h2>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Name</span>
                    <input
                      name="name"
                      value={projectForm.name}
                      onChange={handleProjectChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                    {projectErrors.name ? <p className="mt-2 text-sm text-red-300">{projectErrors.name}</p> : null}
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Description</span>
                    <textarea
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectChange}
                      rows="5"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                    {projectErrors.description ? <p className="mt-2 text-sm text-red-300">{projectErrors.description}</p> : null}
                  </label>
                  {projectErrors.submit ? <p className="text-sm text-red-300">{projectErrors.submit}</p> : null}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : null}

            {isAdmin ? (
              <form onSubmit={handleCreateTask} className="rounded-[1.75rem] border border-white/10 bg-panel/70 p-5 shadow-glow">
                <h2 className="text-2xl font-semibold text-white">Create Task</h2>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Title</span>
                    <input
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                    {taskErrors.title ? <p className="mt-2 text-sm text-red-300">{taskErrors.title}</p> : null}
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Description</span>
                    <textarea
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskChange}
                      rows="4"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                    />
                    {taskErrors.description ? <p className="mt-2 text-sm text-red-300">{taskErrors.description}</p> : null}
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-300">Due date</span>
                      <input
                        type="date"
                        name="dueDate"
                        value={taskForm.dueDate}
                        onChange={handleTaskChange}
                        min={todayDate}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                      />
                      {taskErrors.dueDate ? <p className="mt-2 text-sm text-red-300">{taskErrors.dueDate}</p> : null}
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-300">Priority</span>
                      <select
                        name="priority"
                        value={taskForm.priority}
                        onChange={handleTaskChange}
                        className="w-full rounded-2xl border border-white/10 bg-bg/90 px-4 py-3 text-white outline-none transition focus:border-sky-400"
                      >
                        <option className="bg-bg text-white" value="Low">Low</option>
                        <option className="bg-bg text-white" value="Med">Med</option>
                        <option className="bg-bg text-white" value="High">High</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm text-slate-300">Assigned to user ID</span>
                    <input
                      name="assignedTo"
                      value={taskForm.assignedTo}
                      onChange={handleTaskChange}
                      placeholder="Paste project member ID here"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
                    />
                    {taskErrors.assignedTo ? <p className="mt-2 text-sm text-red-300">{taskErrors.assignedTo}</p> : null}
                  </label>
                  {taskErrors.submit ? <p className="text-sm text-red-300">{taskErrors.submit}</p> : null}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-orange-400 px-4 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            ) : null}

          </div>

          <div className={isAdmin ? 'space-y-4' : 'space-y-4'}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Tasks</h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {tasks.length} total
              </span>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  canEditStatus={isAdmin || getAssignedUserId(task.assignedTo) === currentUserId}
                  canDelete={user?.role === 'Admin'}
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                />
              ))}

              {!loading && tasks.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-300">
                  No tasks have been added to this project yet.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectView;
