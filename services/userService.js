const jwtService = require('./jwtService');
const { generateSessionId } = require('../utils');
const { StatusCodes } = require('http-status-codes');
const { pool } = require('../webConfig');

// Create a pool of database connections



// Define the user service object
const userService = {};

// Define the function for logging in with email
userService.loginWithEmail = async function (req, res) {
    const email = req.body.email
    const client = await pool.connect();
    try {
        // Find the user with the email in the database
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];
        // If the user does not exist, create a new user with the email
        if (!user) {
            const insertResult = await client.query('INSERT INTO users (email) VALUES ($1) RETURNING *', [email]);
            user = insertResult.rows[0];
        }
        const accessToken = jwtService.generateAccessToken(user)
        const sessionId = await generateSessionId(accessToken)

        res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
        return res.status(StatusCodes.OK).json({ message: 'Login successful' });
    } catch (err) {
        console.log(err)
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Failed to login with this email' });
    } finally {
        client.release();
    }
};

// Export the user service object
module.exports = userService;