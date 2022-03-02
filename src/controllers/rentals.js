import connection from '../db.js';
import dayjs from 'dayjs';

export async function getRentals(req, res) {
    const { customerId, gameId } = req.query;

    try {
        let rentals;

        if (customerId) {
            rentals = await connection.query(`
                SELECT * FROM rentals WHERE id = $1;
            `, [customerId]);

        } else if (gameId) {
            rentals = await connection.query(`
                SELECT * FROM rentals WHERE id = $1;
            `, [gameId]);

        } else {
            rentals = await connection.query(`SELECT * FROM rentals`);
        }

        const resultGames = await connection.query(`SELECT * FROM games`);
        const resultCustomers = await connection.query(`SELECT * FROM customers`);

        rentals = rentals.rows.map(rental => ({
            ...rental,
            customer: resultCustomers.rows.find(customer => customer.id === rental.customerId),
            game: resultGames.rows.find(game => game.id === rental.gameId)
        }));

        res.send(rentals);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}

export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    try {
        const { rows: game } = await connection.query(`
            SELECT * FROM games WHERE id = $1;
        `, [gameId]);

        const { rows: customer } = await connection.query(`
            SELECT * FROM customers WHERE id = $1;
        `, [customerId]);

        if (game.length === 0 || customer.length === 0) {
            return res.sendStatus(400);
        }

        const { pricePerDay } = game[0];
        const originalPrice = daysRented * pricePerDay;
        const rentDate = `${dayjs().year()}-${dayjs().month() + 1}-${dayjs().date()}`;
        const returnDate = null;
        const delayFee = null;

        await connection.query(`
            INSERT INTO rentals 
            ("customerId", "gameId", "daysRented", "originalPrice", "rentDate", "returnDate", "delayFee")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [customerId, gameId, daysRented, originalPrice, rentDate, returnDate, delayFee]);

        res.sendStatus(201);

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
}

export async function returnGame(req, res) {
    try {
        const { id } = req.params;

        const { rows: rentals } = await connection.query(`
            SELECT * FROM rentals WHERE id = $1;
        `, [id]);

        if (rentals.length === 0) return res.sendStatus(404);

        const rental = rentals[0];
        if (rental.returnDate !== null) return res.sendStatus(400);

        const delayFee = delayFeeCalculator(rental.rentDate, rental.daysRented, rental.originalPrice);

        await connection.query(`
            UPDATE rentals
                SET "returnDate" = $1, "delayFee" = $2
                WHERE id = $3
        `, [new Date(), delayFee, id]);

        res.sendStatus(200);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}

function delayFeeCalculator(rentedDate, days, originalPrice) {
    const expirationMiliseconds = rentedDate.getTime() + days * 24 * 60 * 60 * 1000;
    const todayMiliseconds = Date.now();
    const pricePerDay = originalPrice / days;

    const differenceDays = Math.ceil((expirationMiliseconds - todayMiliseconds) / 1000 / 60 / 60 / 24);

    if (differenceDays >= 0) return 0;
    return Math.abs(differenceDays * pricePerDay);
}

export async function deleteRentals(req, res) {
    try {
        const { id } = req.params;

        const { rows: rentals } = await connection.query(`
            SELECT * FROM rentals WHERE id = $1
        `, [id]);

        if (rentals.length === 0) return res.sendStatus(404);

        const rental = rentals[0];
        if (rental.returnDate !== null) return res.sendStatus(400);

        await connection.query(`
            DELETE FROM rentals WHERE id = $1;
        `, [id]);

        res.sendStatus(200);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}