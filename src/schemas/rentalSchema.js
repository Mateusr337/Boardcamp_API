import joi from 'joi';

const rentalSchema = joi.object({
    customerId: joi.number().integer().required(),
    gameId: joi.number().integer().required(),
    daysRented: joi.number().integer().required().min(1)
});

export default rentalSchema;