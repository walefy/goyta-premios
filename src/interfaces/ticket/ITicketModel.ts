import { CreationTicket, ITicket } from './ITicket';
import { IPrize } from './IPrize';
import { IQuota } from './IQuota';

export interface ITicketModel {
  create(newTicket: CreationTicket): Promise<ITicket>;
  findAll(): Promise<ITicket[]>;
  findById(id: string): Promise<ITicket | null>;
  update(id: string, ticket: Partial<ITicket>): Promise<ITicket>;
  delete(id: string): Promise<boolean>;
  addPrize(ticketId: string, prize: IPrize): Promise<ITicket | null>;
  removePrize(ticketId: string, prizeId: string): Promise<ITicket | null>;
  addQuotas(ticketId: string, quotas: IQuota[]): Promise<ITicket | null>;
  buyQuotaByDrawnNumber(ticketId: string, number: string, buyerId: string, paymentId: string, status: 'sold' | 'pending'): Promise<ITicket>;
  buyQuotasByDrawnNumbers(ticketId: string, numbers: string[], buyerId: string, paymentId: string): Promise<ITicket>;
}
