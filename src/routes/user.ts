import { Request, Response, Router } from 'express';
import { UserController } from '../controllers/User';
import { UserService } from '../services/User';
import { TokenAuth } from '../entities/AuthToken';
import { jwtAuth } from '../middlewares/jwtAuth';
import { UserModelMongo } from '../models/User';
import { isSameUser } from '../middlewares/isSameUser';
import { Password } from '../entities/Password';

export const userRouter = Router();
const tokenAuth = new TokenAuth();
const passwordInstance = new Password();
const userModel = new UserModelMongo();
const userService = new UserService(userModel, tokenAuth, passwordInstance);
const userController = new UserController(userService);

userRouter.get('/', jwtAuth(true), (req: Request, res: Response) =>
  userController.findAll(req, res));

userRouter.get('/:id', jwtAuth(), (req: Request, res: Response) =>
  userController.findById(req, res));

userRouter.post('/', (req: Request, res: Response) => userController.create(req, res));
userRouter.put(
  '/:id',
  jwtAuth(),
  isSameUser,
  (req: Request, res: Response) => userController.update(req, res));

userRouter.delete('/:id', jwtAuth(), isSameUser, (req: Request, res: Response) =>
  userController.delete(req, res));

userRouter.post('/admin', (req: Request, res: Response) => userController.createAdmin(req, res));
userRouter.post('/login', (req: Request, res: Response) => userController.login(req, res));
