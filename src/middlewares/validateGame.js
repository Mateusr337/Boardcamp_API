import gameSchema from '../schemas/gameSchema.js';

export default function validateGameSchema(req, res, next) {
    const validation = gameSchema.validate(req.body);
    if (validation.error) return res.sendStatus(422);

    if (req.body.categoryId <= 0 || req.body.pricePerDay <= 0) return res.sendStatus(400);

    next();
}