import connection from '../db.js';
import SqlString from 'sqlstring';

export async function postGame(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    try {
        await connection.query(`
            INSERT INTO games 
                (name, image, "stockTotal", "categoryId", "pricePerDay")
                VALUES ($1, $2, $3, $4, $5)
        `, [name, image, parseInt(stockTotal), categoryId, parseInt(pricePerDay * 100)]);

        res.sendStatus(201);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}

export async function getGames(req, res) {

    const orderByFilters = {
        id: 1,
        name: 2,
        image: 3,
        stockTotal: 4,
        categoryId: 5,
        pricePerDay: 6,
        categoryName: 7,
        rentalsCount: 8
    }

    try {
        let offset = '';
        req.query.offset && (offset = `OFFSET ${SqlString.escape(req.query.offset)}`);

        let limit = '';
        req.query.limit && (limit = `LIMIT ${SqlString.escape(req.query.limit)}`);

        let name = '';
        req.query.name && (name = `WHERE  games.name LIKE '%${SqlString.escape(req.query.name)}%'`);

        let order = '';
        req.query.order && (order = `ORDER BY ${SqlString.escape(orderByFilters[req.query.order])}`);
        (req.query.desc === 'true' && req.query.order) && (order = `
            ORDER BY ${SqlString.escape(orderByFilters[req.query.order])} DESC
        `);

        const { rows: games } = await connection.query(`
                SELECT games.*, categories.name AS "categoryName", COUNT(rentals.id) AS "rentalsCount" FROM games
                JOIN categories ON games."categoryId" = categories.id
                JOIN rentals ON games.id = rentals."gameId"
                ${name}
                GROUP BY games.id, categories.id
                ${offset}
                ${limit}
                ${order}
            `);

        res.send(games);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}