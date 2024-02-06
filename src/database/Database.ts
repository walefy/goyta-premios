import mongoose from 'mongoose';
import { IDatabase } from '../interfaces/IDatabase';

export class Database implements IDatabase {
  #connectionString: string

  constructor(connectionString: string) {
    this.#connectionString = connectionString;
    this.#validate();
  }

  async connect() {
    try {
      await mongoose.connect(this.#connectionString);
      console.log('🔗 Database connection successful');
    } catch (error) {
      console.error(error);
      throw new Error('Database connection error')
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔗 Database disconnected');
    } catch (error) {
      console.error(error);
      throw new Error('Database disconnection error')
    }
  }

  #validate() {
    if (this.#connectionString.trim() === '') {
      throw new Error('Invalid connection string');
    }
  }
}
