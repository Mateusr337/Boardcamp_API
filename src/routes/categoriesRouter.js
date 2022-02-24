import { Router } from 'express';
import { getCategories, postCategories } from '../controllers/categories.js';


const categoriesRouter = Router();
categoriesRouter.post('/categories', postCategories);
categoriesRouter.get('/categories', getCategories);

export default categoriesRouter;