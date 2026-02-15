import type { Response } from 'express';
import Project from '../models/Project';
import TimeLog from '../models/TimeLog';
import type { AuthRequest } from '../middleware/auth';

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    const projects = await Project.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    return res.json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export async function createProject(req: AuthRequest, res: Response) {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.userId,
    });
    return res.status(201).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  try {
    const { name, color, description } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (description !== undefined) updates.description = description;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true },
    );
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    await TimeLog.deleteMany({
      projectId: req.params.id,
      userId: req.userId,
    });

    await Project.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    return res.json({
      message: 'Проект и логи успешно удалены',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
}
