import joi from 'joi';

const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().required().uri(),
    stockTotal: joi.number().required().integer(),
    categoryId: joi.number().required().integer(),
    pricePerDay: joi.number().required()
});

export default gameSchema;