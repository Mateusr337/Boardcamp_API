import connection from "../db.js";
import customersSchema from "../schemas/customersSchema.js";

export default async function validateCustomersSchema(req, res, next) {
    const { cpf } = req.body;
    const validation = customersSchema.validate(req.body);

    if (validation.error) {
        console.log(validation.error.message);
        return res.sendStatus(400);
    }

    const findedCustomers = await connection.query(`
        SELECT * FROM customers WHERE cpf = $1;
    `, [cpf]);

    if (findedCustomers.rows.length > 0) return res.sendStatus(409);

    next();
}