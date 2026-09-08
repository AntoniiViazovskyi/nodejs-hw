import { Schema, model } from 'mongoose';
import { emailRegex } from '../constants/emailRegexp.js';

const userSchema = new Schema(
  {
    username: {
      type: String,
      minLength: 3,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: emailRegex,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
  },
  { versionKey: false, timestamps: true },
);

userSchema.pre('save', function () {
  if (!this.username) {
    this.username = this.email;
  }
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = model('User', userSchema);
