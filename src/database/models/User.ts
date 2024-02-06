import { Schema, Document, model } from 'mongoose';
import { IUser } from '../../interfaces/user/IUser';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  image: String,
  role: {
    type: String,
    required: true,
    default: 'user',
  },
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

export const User = model<IUser>('User', userSchema);
