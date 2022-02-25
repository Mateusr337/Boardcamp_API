import connection from '../db.js';

export async function getCustomers(req, res) {

    try {
        const customers = await connection.query(`
            SELECT * FROM customers;
        `);

        res.send(customers.rows);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}

export async function postCustomers(req, res) {
    try {
        const { name, cpf, phone, birthday } = req.body;

        await connection.query(`
            INSERT INTO 
                customers (name, cpf, phone, birthday)
                VALUES ($1, $2, $3, $4)
        `, [name, cpf, phone, birthday]);

        res.sendStatus(201);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}