import { Router } from 'express';
import { getGames, postGame } from '../controllers/games.js';
import validateGameSchema from '../middlewares/validateGame.js';

const gamesRouter = Router();
gamesRouter.post('/games', validateGameSchema, postGame);
gamesRouter.get('/games', getGames);

export default gamesRouter;