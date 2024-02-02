import express from 'express';
import { IDatabase } from './interfaces/IDatabase';

export class App {
  #app: express.Express;
  #database: IDatabase;

  constructor(database: IDatabase) {
    this.#app = express();
    this.#config();
    this.#routes();
    this.#app.get('/', (_req, res) => res.json({ ok: true }));
    this.#database = database;
  }

  #routes(): void {
    // this.app.use(mainRouter);
    console.log('not implemented');
  }

  #config(): void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    };

    this.#app.use(express.json());
    this.#app.use(accessControl);
  }

  public async start(PORT: string | number): Promise<void> {
    try {
      await this.#database.connect();
      this.#app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof Error) message = error.message;
      console.error('Server exited with error', message);
    }
  }
}
