import { Router } from 'express';
import { getCustomers, postCustomers } from '../controllers/customers.js';
import validateCustomersSchema from '../middlewares/validateCustomers.js';

const customersRouter = Router();
customersRouter.get('/customers', getCustomers);
customersRouter.post('/customers', validateCustomersSchema, postCustomers);

export default customersRouter;