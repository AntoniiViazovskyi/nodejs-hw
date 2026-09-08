import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    tag,
    search,
    sortBy = '_id',
    sortOrder = 'asc',
  } = req.query;
  const { _id: userId } = req.user;
  const skip = (page - 1) * perPage;
  const noteQuery = Note.find();
  if (userId) {
    noteQuery.where('userId').equals(userId);
  }
  if (tag) {
    noteQuery.where('tag').equals(tag);
  }

  if (search) {
    noteQuery.where({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    });
  }
  const [notes, totalNotes] = await Promise.all([
    noteQuery
      .clone()
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder })
      .populate('userId', 'username'),
    noteQuery.countDocuments(),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);
  res.status(200).json({ page, perPage, totalNotes, totalPages, notes });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const { _id: userId } = req.user;
  const note = await Note.findOne({ _id: noteId, userId: userId });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

export const createNote = async (req, res) => {
  const { _id: userId } = req.user;
  const note = await Note.create({ ...req.body, userId });
  await note.populate('userId', 'username');
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const { _id: userId } = req.user;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: userId,
  });

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { _id: userId } = req.user;
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: userId },
    req.body,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );

  if (!note) {
    throw createHttpError(404, 'Note not found');
  }

  res.status(200).json(note);
};
