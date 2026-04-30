const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const isValidObjectId = (value) => {
  return value && /^[a-fA-F0-9]{24}$/.test(value.toString());
};

const isTodayOrFutureDate = (value) => {
  const inputDate = new Date(value);
  if (Number.isNaN(inputDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate >= today;
};

const isMemberOfProject = (project, userId) => {
  const memberIds = (project.members || []).map((member) => (member?._id || member).toString());
  const createdById = (project.createdBy?._id || project.createdBy).toString();

  return memberIds.includes(userId.toString()) || createdById === userId.toString();
};

const validateAssignee = async (assigneeId) => {
  if (!isValidObjectId(assigneeId)) {
    return false;
  }

  const validUser = await User.findById(assigneeId).select('_id');
  return Boolean(validUser);
};

const canEditTask = (task, user) => {
  if (user.role === 'Admin') {
    return true;
  }

  return task.assignedTo && task.assignedTo.toString() === user._id.toString();
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedTo } = req.body;

    if (!title || !description || !dueDate || !projectId) {
      return res.status(400).json({ message: 'Title, description, due date, and project are required' });
    }

    if (!isTodayOrFutureDate(dueDate)) {
      return res.status(400).json({ message: 'Due date must be today or later' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (assignedTo) {
      const assigneeExists = await validateAssignee(assignedTo);
      if (!assigneeExists) {
        return res.status(400).json({ message: 'User ID does not exist' });
      }
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority: priority || 'Med',
      projectId,
      assignedTo: assignedTo || null,
    });

    if (assignedTo) {
      project.members.addToSet(assignedTo);
      await project.save();
    }

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email role');

    res.status(201).json({ task: populatedTask });
  } catch (error) {
    next(error);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const taskFilter = req.user.role === 'Admin'
      ? { projectId }
      : { projectId, assignedTo: req.user._id };

    const tasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'Admin' && !isMemberOfProject(project, req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowedFieldsForMember = ['status'];
    const incomingFields = Object.keys(req.body);

    if (req.user.role !== 'Admin' && incomingFields.some((field) => !allowedFieldsForMember.includes(field))) {
      return res.status(403).json({ message: 'Members can only update task status' });
    }

    ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo'].forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    if (req.body.dueDate && !isTodayOrFutureDate(req.body.dueDate)) {
      return res.status(400).json({ message: 'Due date must be today or later' });
    }

    if (req.body.assignedTo !== undefined) {
      if (req.body.assignedTo) {
        const assigneeExists = await validateAssignee(req.body.assignedTo);
        if (!assigneeExists) {
          return res.status(400).json({ message: 'User ID does not exist' });
        }

        project.members.addToSet(req.body.assignedTo);
        await project.save();
      }
    }

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email role');
    res.json({ task: populatedTask });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
};
