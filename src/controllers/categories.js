import connection from "../db.js";


export async function getCategories(req, res) {
    const categories = await connection.query(`
        SELECT * FROM categories;
    `);
    res.send(categories.rows);
}

export async function postCategories(req, res) {
    const { name } = req.body;
    if (!name) return res.sendStatus(400);

    const categories = await connection.query(`
        SELECT * FROM categories;
    `);

    const categoryFound = categories.rows.find(category => category.name === name);
    if (categoryFound) return res.sendStatus(409);

    await connection.query(`
        INSERT INTO categories (name) VALUES ($1);
    `, [name]
    );
    res.sendStatus(201);
}