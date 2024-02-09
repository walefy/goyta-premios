import { IPrize } from './IPrize';
import { IQuota } from './IQuota';

export interface ITicket {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  price: number;
  quantity: number;
  limitByUser: number;
  status: 'running' | 'closed';
  quotas: IQuota[];
  prizes: IPrize[];
}

type ITicketWithoutPrizesAndQuotas = Omit<ITicket, 'prizes' | 'quotas'>;

export interface ReturnTicket extends ITicketWithoutPrizesAndQuotas {
  prizes: Omit<IPrize, 'drawNumber'>[];
  quotas: Omit<IQuota, 'paymentId'>[];
}

export type TicketWithoutId = Omit<ITicket, 'id'>;
export type CreationTicket = Omit<ITicket, 'id' | 'startDate' | 'endDate' | 'status' | 'quotas'>;
export type UpdateTicket = Partial<Omit<ITicketWithoutPrizesAndQuotas, 'id'>>;

// uma cota premida tem que ter o mesmo drawnNumber que um dos prêmios