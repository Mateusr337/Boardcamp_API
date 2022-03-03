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
        const name = `%${req.query.name}%`
        let games;

        if (name) {
            games = await connection.query(`
                SELECT games.*, categories.name AS "categoryName" FROM games
                JOIN categories ON games."categoryId" = categories.id
                WHERE  games.name LIKE $1
            `, [name]);

        } else {
            games = await connection.query(`
                SELECT games.*, categories.name AS "categoryName" FROM games
                JOIN categories ON games."categoryId" = categories.id
            `);
        }

        res.send(games.rows);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}