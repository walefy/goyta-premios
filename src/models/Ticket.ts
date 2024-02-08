import { CreationTicket, ITicket } from '../interfaces/ticket/ITicket';
import { ITicketModel } from '../interfaces/ticket/ITicketModel';
import { Ticket } from '../database/models/Ticket';
import { IPrize } from '../interfaces/ticket/IPrize';
import { IQuota } from '../interfaces/ticket/IQuota';
import { EntityWithMongoId } from '../interfaces/EntityWithMongoId';

export class TicketMongoModel implements ITicketModel {
  async create(newTicket: CreationTicket) {
    const ticket = await Ticket.create(newTicket);
    return this.#removeMongoId(ticket);
  }

  async findAll() {
    const tickets = await Ticket.find();
    return tickets.map((ticket) => this.#removeMongoId(ticket));
  }

  async findById(id: string): Promise<ITicket | null> {
    const ticket = await Ticket.findById(id);
    if (!ticket) return null;
    return this.#removeMongoId(ticket);
  }

  async update(id: string, ticket: Partial<ITicket>) {
    await Ticket.updateOne({ _id: id }, ticket);

    const updatedTicket = await this.findById(id);

    if (!updatedTicket) {
      throw new Error('Ticket not found');
    };

    return updatedTicket;
  }

  async delete(id: string): Promise<boolean> {
    const res = await Ticket.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  async addPrize(ticketId: string, prize: IPrize) {
    await Ticket.updateOne({ _id: ticketId }, { $push: { prizes: prize } });

    const ticket = await this.findById(ticketId);
    return ticket;
  }

  async removePrize(ticketId: string, prizeId: string) {
    await Ticket.updateOne({ _id: ticketId }, { $pull: { prizes: { _id: prizeId } } });

    const ticket = await this.findById(ticketId);
    return ticket;
  }

  async addQuotas(ticketId: string, quotas: IQuota[]) {
    await Ticket.updateOne({ _id: ticketId }, { $push: { quotas: { $each: quotas } } });

    const ticket = await this.findById(ticketId);
    return ticket;
  }

  async buyQuotaByDrawnNumber(ticketId: string, number: string, buyerId: string, paymentId: string) {
    const res = await Ticket.updateOne(
      { _id: ticketId, 'quotas.drawnNumber': number, 'quotas.status': 'available' },
      {
        $set: { 'quotas.$.status': 'sold', 'quotas.$.buyer': buyerId, 'quotas.$.paymentId': paymentId }
      }
    );

    if (res.modifiedCount === 0) {
      throw new Error('Quota not found');
    }

    const ticket = await this.findById(ticketId);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }

  async buyQuotaById(ticketId: string, quotaId: string, buyerId: string, paymentId: string) {
    const res = await Ticket.updateOne(
      { _id: ticketId, 'quotas._id': quotaId, 'quotas.status': 'available' },
      {
        $set: { 'quotas.$.status': 'sold', 'quotas.$.buyer': buyerId, 'quotas.$.paymentId': paymentId }
      }
    );

    if (res.modifiedCount === 0) {
      throw new Error('Quota not found');
    }

    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  async buyQuotasByDrawnNumbers(ticketId: string, numbers: string[], buyerId: string, paymentId: string) {
    const res = await Ticket.updateMany(
      { _id: ticketId, 'quotas.drawnNumber': { $in: numbers }, 'quotas.status': 'available' },
      {
        $set: { 'quotas.$[quota].status': 'sold', 'quotas.$[quota].buyer': buyerId, 'quotas.$[quota].paymentId': paymentId }
      },
      { arrayFilters: [{ 'quota.drawnNumber': { $in: numbers } }] }
    );

    if (res.modifiedCount === 0) {
      throw new Error('Quota not found');
    }

    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }
  

  #removeMongoId(ticket: EntityWithMongoId<ITicket>): ITicket {
    const cleanTicket = ticket.toObject();
    const { _id, ...ticketWithoutId } = cleanTicket;
    return ticketWithoutId;
  }
}
