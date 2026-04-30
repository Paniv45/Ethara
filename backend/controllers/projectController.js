const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const isMemberOfProject = (project, userId) => {
  const memberIds = (project.members || []).map((member) => (member?._id || member).toString());
  const createdById = (project.createdBy?._id || project.createdBy).toString();

  return memberIds.includes(userId.toString()) || createdById === userId.toString();
};

const hasAssignedTaskInProject = async (projectId, userId) => {
  return Task.exists({ projectId, assignedTo: userId });
};

const getProjects = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role !== 'Admin') {
      const assignedProjectIds = await Task.distinct('projectId', { assignedTo: req.user._id });

      filter = {
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id },
          { _id: { $in: assignedProjectIds } },
        ],
      };
    }

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const canAccessProject =
      req.user.role === 'Admin' ||
      isMemberOfProject(project, req.user._id) ||
      (await hasAssignedTaskInProject(project._id, req.user._id));

    if (!canAccessProject) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role !== 'Admin' && !isMemberOfProject(project, req.user._id)) {
      project.members.addToSet(req.user._id);
      await project.save();
      
      project = await Project.findById(project._id)
        .populate('createdBy', 'name email role')
        .populate('members', 'name email role');
    }

    const tasks = await Task.find(
      req.user.role === 'Admin'
        ? { projectId: project._id }
        : { projectId: project._id, assignedTo: req.user._id }
    )
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1 });

    res.json({ project, tasks });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = req.body.name ?? project.name;
    project.description = req.body.description ?? project.description;

    await project.save();
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const assignMembers = async (req, res, next) => {
  try {
    const { memberIds = [] } = req.body;

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'memberIds must be an array' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const validUsers = await User.find({ _id: { $in: memberIds } }).select('_id');
    const validIds = validUsers.map((user) => user._id.toString());

    const mergedMembers = new Set([
      ...project.members.map((member) => member.toString()),
      ...validIds,
    ]);

    project.members = Array.from(mergedMembers);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.json({ project: populatedProject });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignMembers,
};
