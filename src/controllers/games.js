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
    let sendGames = [];

    try {
        const games = (await connection.query(`
        SELECT * FROM games;
    `)).rows;

        for (const game of games) {
            const { categoryId } = game;

            let categoryName = await connection.query(`
            SELECT name FROM categories WHERE id = $1;
        `, [categoryId])

            categoryName = categoryName.rows[0].name;
            sendGames.push({ ...game, categoryName });
        }
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }

    res.send(sendGames);
}