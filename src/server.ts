import { App } from './App';
import { Database } from './database/Database';
import { User } from './database/models/User';

const PORT = process.env.APP_PORT || 3001;
const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || '';

const database = new Database(CONNECTION_STRING);
new App(database).start(PORT);
