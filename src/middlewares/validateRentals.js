import rentalSchema from '../schemas/rentalSchema.js';
import connection from '../db.js';

export default async function validateRentals(req, res, next) {
    const validation = rentalSchema.validate(req.body);
    const { customerId } = req.body;

    if (validation.error) {
        console.log(validation.error.message);
        return res.sendStatus(400);
    }

    try {
        const { rows: customers } = await connection.query(`
            SELECT id FROM customers WHERE id = $1;
        `, [customerId]);

        if (customers.length === 0) {
            return res.sendStatus(400);
        }

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }

    next();
}