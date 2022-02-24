import connection from '../db.js';

export async function postGame(req, res) {
    console.log(req.body);
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    try {
        await connection.query(`
            INSERT INTO games 
                (name, image, stockTotal, categoryId, pricePerDay)
                VALUES ($1, $2, $3, $4, $5)
        `, [name, image, stockTotal, categoryId, pricePerDay]);

    } catch (error) { return res.sendStatus(500) }

    res.sendStatus(201);
}

export async function getGames(req, res) {
    res.send([
        {
            id: 2,
            name: 'Detetive',
            image: 'http://',
            stockTotal: 1,
            categoryId: 2,
            pricePerDay: 2500,
            categoryName: 'Investigação'
        }
    ]);
}