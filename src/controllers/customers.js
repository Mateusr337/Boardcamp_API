import connection from '../db.js';
import SqlString from 'sqlstring';

export async function getCustomers(req, res) {

    const orderByFilters = {
        id: 1,
        name: 2,
        phone: 3,
        cpf: 4,
        birthday: 5,
        rentalsCount: 6
    }

    let offset = '';
    req.query.offset && (offset = `OFFSET ${SqlString.escape(req.query.offset)}`);

    let limit = '';
    req.query.limit && (limit = `LIMIT ${SqlString.escape(req.query.limit)}`);

    let order = '';
    req.query.order && (order = `ORDER BY ${SqlString.escape(orderByFilters[req.query.order])}`);
    (req.query.desc === 'true' && req.query.order) && (order = `
        ORDER BY ${SqlString.escape(orderByFilters[req.query.order])} DESC
    `);

    try {
        const customers = await connection.query(`
            SELECT customers.*, COUNT(*) AS "rentalsCount" FROM customers
            JOIN rentals ON customers.id = rentals."customerId"
            GROUP BY customers.id
            ${limit}
            ${offset}
            ${order}
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

        const findedCustomers = await connection.query(`
            SELECT * FROM customers WHERE cpf = $1;
        `, [cpf]);

        if (findedCustomers.rows.length > 0) return res.sendStatus(409);

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

export async function getCustomersById(req, res) {
    const { id } = req.params;

    try {
        const customer = await connection.query(`
            SELECT * FROM customers WHERE id = $1;
        `, [id]);

        if (customer.rows.length === 0) return res.sendStatus(404);

        res.send(customer.rows[0]);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}

export async function updateCustomers(req, res) {
    const { id } = req.params;
    const { name, cpf, phone, birthday } = req.body;

    try {

        const findedCustomers = await connection.query(`
            SELECT * FROM customers WHERE cpf = $1 AND id <> $2;
        `, [cpf, id]);

        if (findedCustomers.rows.length > 0) return res.sendStatus(409);

        await connection.query(`
            UPDATE customers
                SET name = $1, cpf = $2, phone = $3, birthday = $4 
                WHERE id = $5;
        `, [name, cpf, phone, birthday, id]);

        res.sendStatus(200);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }

    res.sendStatus(200);
}