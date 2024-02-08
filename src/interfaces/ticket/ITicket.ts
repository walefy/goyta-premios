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

export type TicketWithoutId = Omit<ITicket, 'id'>;
export type CreationTicket = Omit<ITicket, 'id' | 'startDate' | 'endDate' | 'status' | 'quotas'>;


// uma cota premida tem que ter o mesmo drawnNumber que um dos prêmios