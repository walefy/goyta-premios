import { Request, Response } from 'express';
import { IUserService } from '../interfaces/user/IUserService';

export class UserController {
  #service: IUserService;

  constructor(service: IUserService) {
    this.#service = service;
  }

  async findAll(req: Request, res: Response) {
    const { status, data } = await this.#service.findAll();
    return res.status(status).json(data);
  }
}