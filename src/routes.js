import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import authMiddleware from './app/middlewares/auth';
import MeetupController from './app/controllers/MeetupController';
import OrganizerController from './app/controllers/OrganizerController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

/* unauthenticated basic routes */
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

/* authenticated routes only */
routes.put('/users', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);

/* MeetUps */
routes.post('/meetups', MeetupController.store);
routes.get('/meetups', MeetupController.index);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

/* Organizers */
routes.get('/organizer', OrganizerController.index);

/* Subscriptions of users */
routes.get('/subscriptions', SubscriptionController.index);

/* Subscriptions and meetups of users */
routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);
export default routes;
