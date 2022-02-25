import { Router } from 'express';
import { getCustomers, getCustomersById, postCustomers, updateCustomers } from '../controllers/customers.js';
import validateCustomersSchema from '../middlewares/validateCustomers.js';

const customersRouter = Router();
customersRouter.get('/customers', getCustomers);
customersRouter.post('/customers', validateCustomersSchema, postCustomers);
customersRouter.get('/customers/:id', getCustomersById);
customersRouter.put('/customers/:id', validateCustomersSchema, updateCustomers);

export default customersRouter;