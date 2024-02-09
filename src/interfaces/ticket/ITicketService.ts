import { HttpStatusCode } from '../../enums/HttpStatusCode';
import { IServiceResponse } from '../IServiceResponse';
import { CreatePaymentWithoutId } from '../Payment/IPayment';
import { IPrizeWithoutDrawNumber } from './IPrize';
import { CreationTicket, ReturnTicket, UpdateTicket } from './ITicket';

export type WebHookNotificationReturn = {
  status: HttpStatusCode.OK;
  data: null;
};

export interface ITicketService {
  create(newTicket: CreationTicket): Promise<IServiceResponse<ReturnTicket>>;
  findAll(): Promise<IServiceResponse<ReturnTicket[]>>;
  findById(id: string): Promise<IServiceResponse<ReturnTicket | null>>;
  update(id: string, ticket: UpdateTicket): Promise<IServiceResponse<ReturnTicket>>;
  delete(id: string): Promise<IServiceResponse<null>>;
  addPrize(ticketId: string, prize: IPrizeWithoutDrawNumber): Promise<IServiceResponse<ReturnTicket>>;
  removePrize(ticketId: string, prizeId: string): Promise<IServiceResponse<ReturnTicket>>;
  buyQuota(ticketId: string, userId: string, drawnNumber: string): Promise<IServiceResponse<CreatePaymentWithoutId>>;
  confirmBuyQuota(ticketId: string, paymentId: string): Promise<WebHookNotificationReturn>;
}
