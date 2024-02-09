import { Request, Response, Router } from 'express';
import { TicketController } from '../controllers/Ticket';
import { TicketService } from '../services/Ticket';
import { TicketMongoModel } from '../models/Ticket';
import { MercadoPagoPayment } from '../entities/Payment';
import { UserModelMongo } from '../models/User';
import { jwtAuth } from '../middlewares/jwtAuth';

export const ticketRouter = Router();
const ticketModel = new TicketMongoModel();
const userModel = new UserModelMongo();
const payment = new MercadoPagoPayment();
const ticketService = new TicketService(ticketModel, payment, userModel);
const ticketController = new TicketController(ticketService);

ticketRouter.post('/', jwtAuth(true), (req: Request, res: Response) => ticketController.create(req, res));
ticketRouter.get('/:id', jwtAuth(), (req: Request, res: Response) => ticketController.findById(req, res));
ticketRouter.get('/', jwtAuth(), (req: Request, res: Response) => ticketController.findAll(req, res));
ticketRouter.delete('/:id', jwtAuth(true), (req: Request, res: Response) => ticketController.delete(req, res));
ticketRouter.post('/:id/buy-quota', jwtAuth(), (req: Request, res: Response) => ticketController.buyQuota(req, res));
ticketRouter.post('/:id/add-prize', jwtAuth(true), (req: Request, res: Response) => ticketController.addPrize(req, res));
ticketRouter.delete('/:id/remove-prize/:prizeId', jwtAuth(true), (req: Request, res: Response) => ticketController.removePrize(req, res));
ticketRouter.put('/:id', jwtAuth(true), (req: Request, res: Response) => ticketController.update(req, res));
ticketRouter.post('/notify-payment/:id', (req: Request, res: Response) => ticketController.confirmBuyQuota(req, res));
