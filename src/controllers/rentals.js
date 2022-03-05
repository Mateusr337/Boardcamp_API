import connection from '../db.js';
import dayjs from 'dayjs';
import SqlString from 'sqlstring';

export async function getRentals(req, res) {
    const { customerId, gameId, status, desc } = req.query;

    const orderByFilters = {
        id: 1,
        name: 2,
    }

    let filter = '';
    gameId && (filter = `WHERE "gameId" = ${SqlString.escape(gameId)}`);
    customerId && (filter = `WHERE "customerId" = ${SqlString.escape(customerId)}`);

    if (status) {
        if (status === 'open' || status === 'closed') {
            filter.includes('WHERE') ? filter = filter + ' AND' : filter = 'WHERE';
            status === 'open' ? filter = filter + ` "returnDate" is null` : filter = filter + ` "returnDate" is not null`;
        }
    }

    let offset = '';
    req.query.offset && (offset = `OFFSET ${SqlString.escape(req.query.offset)}`);

    let limit = '';
    req.query.limit && (limit = `LIMIT ${SqlString.escape(req.query.limit)}`);

    let order = '';
    req.query.order && (order = `ORDER BY ${SqlString.escape(orderByFilters[req.query.order])}`);
    (desc === 'true' && req.query.order) && (order = `
        ORDER BY ${SqlString.escape(orderByFilters[req.query.order])} DESC
    `);

    console.log(filter);

    try {
        let rentals = await connection.query(`
            SELECT * FROM rentals
            ${filter}
            ${offset}
            ${limit}
            ${order}
        `);

        const resultGames = await connection.query(`
            SELECT 
                games.id, 
                games."categoryId", 
                games.name AS "name",
                categories.name AS "categoryName"
                FROM games 
                JOIN categories ON games."categoryId" = categories.id
        `);
        const resultCustomers = await connection.query(`SELECT id, name FROM customers`);

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

export async function getMetrics(req, res) {
    try {
        let rentals;
        const { startDate, endDate } = req.query;

        if (startDate && endDate) {
            rentals = await connection.query(`
                SELECT SUM("originalPrice") AS "originalPriceSum", 
                    SUM("delayFee") AS "delayFeeSum",
                    COUNT(id) AS rentals
                    FROM rentals
                    WHERE "rentDate" >= $1 AND "rentDate" <= $2
            `, [startDate, endDate]);

        } else if (startDate) {
            rentals = await connection.query(`
                SELECT SUM("originalPrice") AS "originalPriceSum", 
                    SUM("delayFee") AS "delayFeeSum",
                    COUNT(id) AS rentals
                    FROM rentals
                    WHERE $1 <= "rentDate"
                `, [startDate]);

        } else if (endDate) {
            rentals = await connection.query(`
                SELECT SUM("originalPrice") AS "originalPriceSum", 
                    SUM("delayFee") AS "delayFeeSum",
                    COUNT(id) AS rentals
                    FROM rentals
                    WHERE $1 >= "rentDate"
                `, [endDate]);

        } else {
            rentals = await connection.query(`
                SELECT SUM("originalPrice") AS "originalPriceSum", 
                    SUM("delayFee") AS "delayFeeSum",
                    COUNT(id) AS rentals
                    FROM rentals
            `);
        }
        rentals = rentals.rows;

        const data = rentals.map(rental => ({
            revenue: parseInt(rental.originalPriceSum + rental.delayFeeSum),
            rentals: parseInt(rental.rentals),
            average: Math.round((rental.originalPriceSum + rental.delayFeeSum) / rental.rentals)
        }));

        res.send(data[0]);

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
}