import { CalendarDays, CheckCircle2, CircleAlert, Clock3, Trash2 } from 'lucide-react';

const statusTone = {
  Todo: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
  'In-Progress': 'bg-blue-500/20 text-blue-100 border-blue-500/30',
  Completed: 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30',
};

const priorityTone = {
  Low: 'text-emerald-300',
  Med: 'text-amber-300',
  High: 'text-red-300',
};

const TaskCard = ({
  task,
  canEditStatus,
  canDelete,
  onStatusChange,
  onDelete,
}) => {
  const overdue = task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="rounded-3xl border border-white/10 bg-panel/80 p-5 shadow-glow backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-300">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[task.status]}`}>
              {task.status}
            </span>
            <span className={`text-xs font-semibold uppercase tracking-[0.25em] ${priorityTone[task.priority]}`}>
              {task.priority} priority
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{task.description}</p>
        </div>

        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200 transition hover:bg-red-400/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <CalendarDays className="h-4 w-4" />
          Due {new Date(task.dueDate).toLocaleDateString()}
        </span>
        {task.assignedTo ? (
          <div className="inline-flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-medium text-slate-100">{task.assignedTo.name}</div>
              <div className="break-all text-xs text-slate-400">ID: {task.assignedTo._id || task.assignedTo}</div>
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <CircleAlert className="h-4 w-4" />
            Unassigned
          </span>
        )}
        {overdue ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-red-200">
            <Clock3 className="h-4 w-4" />
            Overdue
          </span>
        ) : null}
      </div>

      {canEditStatus ? (
        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-slate-300">Update status</label>
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task._id, event.target.value)}
            className="rounded-xl border border-white/10 bg-bg/90 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400"
          >
            <option className="bg-bg text-white" value="Todo">Todo</option>
            <option className="bg-bg text-white" value="In-Progress">In-Progress</option>
            <option className="bg-bg text-white" value="Completed">Completed</option>
          </select>
          <span className="text-xs text-slate-400">Mark the task complete when your work is done.</span>
        </div>
      ) : null}
    </div>
  );
};

export default TaskCard;
