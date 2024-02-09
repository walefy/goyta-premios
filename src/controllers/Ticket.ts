import { Request, Response } from 'express';
import { ITicketService } from '../interfaces/ticket/ITicketService';
import { CreationTicket } from '../interfaces/ticket/ITicket';

export class TicketController {
  #service: ITicketService;

  constructor(service: ITicketService) {
    this.#service = service;
  }

  async create(req: Request, res: Response) {
    const newTicket = req.body as CreationTicket;
    const { status, data } = await this.#service.create(newTicket);
    res.status(status).json(data);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;
    const { status, data } = await this.#service.findById(id);
    res.status(status).json(data);
  }

  async findAll(_req: Request, res: Response) {
    const { status, data } = await this.#service.findAll();
    res.status(status).json(data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const { status, data } = await this.#service.delete(id);
    res.status(status).json(data);
  }

  async buyQuota(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { drawnNumber, userId } = req.body;
      const { status, data } = await this.#service.buyQuota(id, userId, drawnNumber);
      return res.status(status).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error, try latter' });
    }
  }

  async addPrize(req: Request, res: Response) {
    const { id } = req.params;
    const { prize } = req.body;
    const { status, data } = await this.#service.addPrize(id, prize);
    res.status(status).json(data);
  }

  async removePrize(req: Request, res: Response) {
    const { id, prizeId } = req.params;
    const { status, data } = await this.#service.removePrize(id, prizeId);
    res.status(status).json(data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const ticket = req.body;
    const { status, data } = await this.#service.update(id, ticket);
    res.status(status).json(data);
  }

  async confirmBuyQuota(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action, data } = req.body;
  
      if (action !== 'payment.updated' && action !== 'payment.created') {
        return res.status(200).send();
      }
  
      await this.#service.confirmBuyQuota(String(id), String(data.id));
      return res.status(200).send();    
    } catch (error) {
      console.log(error);
    }
  }
}
