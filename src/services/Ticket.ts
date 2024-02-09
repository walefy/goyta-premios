import { ITicketService, WebHookNotificationReturn } from '../interfaces/ticket/ITicketService';
import { HttpStatusCode } from '../enums/HttpStatusCode';
import { CreationTicket, ReturnTicket, UpdateTicket } from '../interfaces/ticket/ITicket';
import { ITicket } from '../interfaces/ticket/ITicket';
import { IQuota } from '../interfaces/ticket/IQuota';
import { IPrizeWithoutDrawNumber } from '../interfaces/ticket/IPrize';
import { validateSchema } from '../utils/schemaValidator';
import { ticketCreationSchema } from '../schemas/ticket/ticketCreationSchema';
import { IPayment } from '../interfaces/Payment/IPayment';
import { IUserModel } from '../interfaces/user/IUserModel';
import { ITicketModel } from '../interfaces/ticket/ITicketModel';

export class TicketService implements ITicketService {
  #model: ITicketModel;
  #payment: IPayment;
  #userModel: IUserModel;

  constructor(model: ITicketModel, payment: IPayment, userModel: IUserModel) {
    this.#model = model;
    this.#payment = payment;
    this.#userModel = userModel;
  }

  async create(newTicket: CreationTicket) {
    const validation = validateSchema(ticketCreationSchema, newTicket)

    if (!validation.valid) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: validation.error || 'Invalid ticket data' }
      }
    }

    const drawnNumbers = this.#generateDrawnNumber(newTicket.quantity);
    const quotas: IQuota[] = drawnNumbers.map((drawnNumber) => ({
      drawnNumber,
      status: 'available',
      buyer: null,
      paymentId: null
    }));

    const startDate = new Date();
    const endDate = null;
    const status = 'running';
    const ticket = await this.#model.create({ ...newTicket, quotas, startDate, endDate, status });
    const cleanedTicket = this.#cleanTicket(ticket);

    return { status: HttpStatusCode.CREATED, data: cleanedTicket };
  }

  async findById(id: string) {
    const ticket = await this.#model.findById(id);
    if (!ticket) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Ticket not found' }
      }
    }
    const cleanedTicket = this.#cleanTicket(ticket);
    return { status: HttpStatusCode.OK, data: cleanedTicket };
  }

  async findAll() {
    const tickets = await this.#model.findAll();
    const cleanedTickets = tickets.map((ticket) => this.#cleanTicket(ticket));
    return { status: HttpStatusCode.OK, data: cleanedTickets };
  }

  async delete(id: string) {
    const ticket = await this.#model.findById(id);

    if (!ticket) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Ticket not found' }
      }
    }

    const deleted = await this.#model.delete(id);
    if (!deleted) {
      return {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        data: { message: 'Error deleting ticket' }
      }
    }

    return { status: HttpStatusCode.NO_CONTENT, data: null };
  }

  async addPrize(ticketId: string, prize: IPrizeWithoutDrawNumber) {
    const ticket = await this.#model.findById(ticketId);

    if (!ticket) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Ticket not found' }
      }
    }

    const drawnNumbers = ticket.quotas.map((quota) => quota.drawnNumber);
    const index = Math.floor(Math.random() * drawnNumbers.length);
    const newPrize = { ...prize, drawNumber: drawnNumbers[index] };
    const updatedTicket = await this.#model.addPrize(ticketId, newPrize);

    const cleanedTicket = this.#cleanTicket(updatedTicket as ITicket);
    return { status: HttpStatusCode.OK, data: cleanedTicket };
  }

  async removePrize(ticketId: string, prizeId: string) {
    const ticket = await this.#model.findById(ticketId);

    if (!ticket) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Ticket not found' }
      }
    }

    const updatedTicket = await this.#model.removePrize(ticketId, prizeId);
    const cleanedTicket = this.#cleanTicket(updatedTicket as ITicket);
    return { status: HttpStatusCode.OK, data: cleanedTicket };
  }

  async update(id: string, ticket: UpdateTicket) {
    const validation = validateSchema(ticketCreationSchema, ticket)

    if (!validation.valid) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: validation.error || 'Invalid ticket data' }
      }
    }

    const updatedTicket = await this.#model.update(id, ticket);
    if (!updatedTicket) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Ticket not found' }
      }
    }
    const cleanedTicket = this.#cleanTicket(updatedTicket);
    return { status: HttpStatusCode.OK, data: cleanedTicket };
  }

  async buyQuota(ticketId: string, userId: string, drawnNumber: string) {
    // TODO: add limit of quotas per user
    if (!userId || !drawnNumber) {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: 'Missing parameters userId or drawnNumber' }
      }
    }

    const ticket = await this.#model.findById(ticketId);

    if (!ticket) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Ticket not found' }
      }
    }

    const quota = ticket.quotas.find((quota) => quota.drawnNumber === drawnNumber);
    if (!quota) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'Quota not found' }
      }
    }

    if (quota.status === 'sold' || quota.status === 'pending') {
      return {
        status: HttpStatusCode.BAD_REQUEST,
        data: { message: 'Quota already sold' }
      }
    }

    const user = await this.#userModel.findById(userId);
    if (!user) {
      return {
        status: HttpStatusCode.NOT_FOUND,
        data: { message: 'User not found' }
      }
    }

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);

    const body = {
      amount: ticket.price,
      payerEmail: user.email,
      description: `Quota ${drawnNumber} of ticket ${ticketId}`,
      expirationDate: expirationDate.toISOString(),
    }
    
    const { id: paymentId, ...paymentResponse } = await this.#payment.create(
      body.amount,
      body.payerEmail,
      body.description,
      body.expirationDate,
      ticketId,
    );    

    await this.#model.buyQuotaByDrawnNumber(
      ticketId,
      drawnNumber,
      userId,
      String(paymentId),
      'pending'
    );

    return { status: HttpStatusCode.OK, data: paymentResponse };
  }

  async confirmBuyQuota(ticketId: string, paymentId: string): Promise<WebHookNotificationReturn> {
    const status = await this.#payment.get(Number(paymentId));

    const notValidStatus = ['rejected', 'cancelled', 'refunded', 'charged_back'];

    if (notValidStatus.includes(status)) {
      await this.#model.cancelQuotaByPaymentId(ticketId, paymentId);
      return { status: HttpStatusCode.OK, data: null };
    }

    if (status !== 'approved') {
      return { status: HttpStatusCode.OK, data: null };
    }

    const ticket = await this.#model.findById(ticketId) as ITicket;
    const quota = ticket.quotas.find((quota) => quota.paymentId === paymentId) as IQuota;

    await this.#model.buyQuotaByDrawnNumber(
      ticketId,
      quota.drawnNumber as string,
      quota.buyer as string,
      quota.paymentId as string,
      'sold'
    );

    return { status: HttpStatusCode.OK, data: null };
  }

  #generateDrawnNumber(quantity: number) {
    return Array.from(
      { length: quantity },
      (_, index) => String(index + 1).padStart(String(quantity).length, '0')
    );
  }

  #cleanTicket(ticket: ITicket): ReturnTicket {
    // remove type (any) to remove _id    
    return {
      ...ticket,
      prizes: ticket.prizes.map((prize) => {
        const { drawNumber, _id, ...rest } = prize as any;
        return rest;
      }),
      quotas: ticket.quotas.map((quota) => {
        const { paymentId, _id, ...rest } = quota as any;
        return rest;
      }),
    }
  }
}
