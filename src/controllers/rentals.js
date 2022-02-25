import connection from '../db.js';

export async function getRentals(req, res) {
    const { customerId } = req.query;

    try {
        if (customerId) {
            const { rows: rentals } = await connection.query(`
                SELECT * FROM rentals WHERE id = $1;
            `, [customerId]);

            res.send(rentals);

        } else {
            const { rows: rentals } = await connection.query(`
                SELECT * FROM rentals;
            `);

            res.send(rentals);
        }
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}