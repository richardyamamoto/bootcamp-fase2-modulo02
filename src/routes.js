import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.get('/providers', ProviderController.index);

// Check the session authorization
routes.use(authMiddleware);

routes.post('/appointments', AppointmentController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.put('/users', UserController.update);

export default routes;
