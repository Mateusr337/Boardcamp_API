import connection from '../db.js';

export async function postGame(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    try {
        await connection.query(`
            INSERT INTO games 
                (name, image, "stockTotal", "categoryId", "pricePerDay")
                VALUES ($1, $2, $3, $4, $5)
        `, [name, image, parseInt(stockTotal), categoryId, parseInt(pricePerDay * 100)]);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
}

export async function getGames(req, res) {
    try {
        let offset = '';
        req.query.offset && (offset = `OFFSET ${req.query.offset}`);

        let limit = '';
        req.query.limit && (limit = `LIMIT ${req.query.limit}`);

        let name = '';
        req.query.name && (name = `WHERE  games.name LIKE '%${req.query.name}%'`);

        const { rows: games } = await connection.query(`
                SELECT games.*, categories.name AS "categoryName", COUNT(rentals.id) AS "rentalsCount" FROM games
                JOIN categories ON games."categoryId" = categories.id
                JOIN rentals ON games.id = rentals."gameId"
                ${name}
                GROUP BY games.id, categories.id
                ${offset}
                ${limit}
            `);

        res.send(games);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}