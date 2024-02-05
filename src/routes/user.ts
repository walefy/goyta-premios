import { Router } from 'express';
import { UserController } from '../controllers/User';
import { UserService } from '../services/User';
import { TokenAuth } from '../entities/AuthToken';
import { jwtAuth } from '../middlewares/jwtAuth';
import { UserModelMongo } from '../models/User';

export const userRouter = Router();
const tokenAuth = new TokenAuth();
const userModel = new UserModelMongo();
const userService = new UserService(userModel, tokenAuth);
const userController = new UserController(userService);

userRouter.get('/', jwtAuth(true), userController.findAll);
