import { Router } from 'express';
import validateRentals from '../middlewares/validateRentals.js';
import {
    deleteRentals,
    getMetrics,
    getRentals,
    postRentals,
    returnGame
} from '../controllers/rentals.js';

const rentalRouter = Router();
rentalRouter.get('/rentals', getRentals);
rentalRouter.post('/rentals', validateRentals, postRentals);
rentalRouter.post('/rentals/:id/return', returnGame);
rentalRouter.delete('/rentals/:id', deleteRentals);
rentalRouter.get('/rentals/metrics', getMetrics);

export default rentalRouter;