import { model, Schema } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      required: false,
      default: 'Todo',
      enum: TAGS,
    },
  },
  { timestamps: true },
);

noteSchema.index({ tag: 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ updatedAt: -1 });
noteSchema.index({ tag: 1, createdAt: -1 });
noteSchema.index({ tag: 1, updatedAt: -1 });

export const noteSortFields = ['_id', 'tag', 'createdAt', 'updatedAt'];

export const Note = model('Note', noteSchema);
