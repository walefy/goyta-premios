import { Router } from 'express';
import { userRouter } from './user';
import { ticketRouter } from './ticket';

export const mainRouter = Router();

mainRouter.use('/user', userRouter);
mainRouter.use('/ticket', ticketRouter);
