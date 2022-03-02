import { Router } from 'express';
import { deleteRentals, getRentals, postRentals, returnGame } from '../controllers/rentals.js';
import validateRentals from '../middlewares/validateRentals.js';

const rentalRouter = Router();
rentalRouter.get('/rentals', getRentals);
rentalRouter.post('/rentals', validateRentals, postRentals);
rentalRouter.post('/rentals/:id/return', returnGame);
rentalRouter.delete('/rentals/:id', deleteRentals);

export default rentalRouter;