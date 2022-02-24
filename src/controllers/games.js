import connection from '../db.js';

export async function postGame(req, res) {
    console.log(req.body);
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
    const games = (await connection.query(`
        SELECT * FROM games;
    `)).rows;

    games.map(game => {
        console.log(game.categoryId);
    });

    res.send(games);
}