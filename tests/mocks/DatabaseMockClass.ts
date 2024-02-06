import { IDatabase } from '../../src/interfaces/IDatabase';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose'


export class DatabaseMockClass implements IDatabase {
  #mongoServer: MongoMemoryServer;
  #uri: string;

  constructor() {
    this.#initialize();
  }
  
  async #initialize() {
    this.#mongoServer = await MongoMemoryServer.create();
    this.#uri = this.#mongoServer.getUri();
    await this.connect();  
  }

  async connect() {
    await mongoose.connect(this.#uri);
  }

  async disconnect() {
    if (!mongoose.connection.readyState) return;

    await mongoose.disconnect();
    await this.#mongoServer.stop();
  }
}
