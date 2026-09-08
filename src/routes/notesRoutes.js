import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  noteIdSchema,
  getAllNotesSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';
import {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from '../controllers/notesController.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', celebrate(getAllNotesSchema), getAllNotes);

router.get('/:noteId', celebrate(noteIdSchema), getNoteById);

router.post(
  '/',
  celebrate(createNoteSchema, { abortEarly: false }),
  createNote,
);

router.delete('/:noteId', celebrate(noteIdSchema), deleteNote);

router.patch('/:noteId', celebrate(updateNoteSchema), updateNote);

export default router;
