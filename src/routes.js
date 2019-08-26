import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
// Call the multer configuration
const upload = multer(multerConfig);

// Users
routes.post('/users', UserController.store);

// Session
routes.post('/sessions', SessionController.store);

// Check the session authorization
routes.use(authMiddleware);

// Users in session
routes.put('/users', UserController.update);

// Providers
routes.get('/providers', ProviderController.index);
// Schedule
routes.get('/schedule', ScheduleController.index);

// Notifications
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);
// Appointments
routes.get('/appointments', AppointmentController.index);

routes.post('/appointments', AppointmentController.store);

// Files
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
