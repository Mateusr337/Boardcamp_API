import joi from 'joi';

const customersSchema = joi.object({
    name: joi.string().required(),
    cpf: joi.string().required().pattern(/^[0-9]{11}$/),
    phone: joi.string().required().pattern(/^[0-9]{10,11}$/),
    birthday: joi.string().required().pattern(/^[0-9]{4}-[0-1]{1}[0-9]{1}-[0-3]{1}[0-9]{1}$/)
});

export default customersSchema;