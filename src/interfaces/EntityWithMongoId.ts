import { Document, Types } from 'mongoose';

export type EntityWithMongoId<T> = Document<unknown, {}, T> & T & {
  _id: Types.ObjectId;
};
