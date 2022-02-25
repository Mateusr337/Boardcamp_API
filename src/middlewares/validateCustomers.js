import customersSchema from "../schemas/customersSchema.js";

export default async function validateCustomersSchema(req, res, next) {
    const { birthday } = req.body;

    if (birthday.length > 10) {
        req.body.birthday = req.body.birthday.slice(0, 10);
    }

    const validation = customersSchema.validate(req.body);

    if (validation.error) {
        console.log(validation.error.message);
        return res.sendStatus(400);
    }

    next();
}