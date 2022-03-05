import connection from "../db.js";
import SqlString from 'sqlstring';

export async function getCategories(req, res) {

    const orderByFilters = {
        id: 1,
        name: 2,
    }

    try {
        let offset = '';
        req.query.offset && (offset = `OFFSET ${SqlString.escape(req.query.offset)}`);

        let limit = '';
        req.query.limit && (limit = `LIMIT ${SqlString.escape(req.query.limit)}`);

        let order = '';
        req.query.order && (order = `ORDER BY ${SqlString.escape(orderByFilters[req.query.order])}`);
        (req.query.desc === 'true' && req.query.order) && (order = `
            ORDER BY ${SqlString.escape(orderByFilters[req.query.order])} DESC
        `);

        const { rows: categories } = await connection.query(`
            SELECT * FROM categories
            ${offset}
            ${limit}
            ${order}
    `);
        res.send(categories);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}

export async function postCategories(req, res) {
    const { name } = req.body;
    if (!name) return res.sendStatus(400);

    try {
        const categories = await connection.query(`
            SELECT * FROM categories;
        `);

        const categoryFound = categories.rows.find(category => category.name === name);
        if (categoryFound) return res.sendStatus(409);

        await connection.query(`
            INSERT INTO categories (name) VALUES ($1);
        `, [name]);

        res.sendStatus(201);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}