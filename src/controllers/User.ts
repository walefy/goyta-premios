import { Request, Response } from 'express';
import { IUserService } from '../interfaces/user/IUserService';

export class UserController {
  #service: IUserService;

  constructor(service: IUserService) {
    this.#service = service;
  }

  async findAll(_req: Request, res: Response) {
    const { status, data } = await this.#service.findAll();
    return res.status(status).json(data);
  }

  async create(req: Request, res: Response) {
    const { name, email, password, phone } = req.body;

    const { status, data } = await this.#service.create({
      name,
      email,
      password,
      phone,
    });

    return res.status(status).json(data);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    const { status, data } = await this.#service.findById(id);

    return res.status(status).json(data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const partialUser = req.body;

    const { status, data } = await this.#service.update(id, partialUser);

    return res.status(status).json(data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const { status, data } = await this.#service.delete(id);

    return res.status(status).json(data);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { status, data } = await this.#service.login(email, password);
    return res.status(status).json(data);
  }
}
