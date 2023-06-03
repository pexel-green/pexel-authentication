const { Pool } = require('pg');
const redis = require('redis');
const nodemailer = require('nodemailer');

const emailRegex = "/^[^\s@]+@[^\s@]+\.[^\s@]+$/";

const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password',
    },
});

const pool = new Pool({
    user: 'your-user',
    host: 'your-host',
    database: 'your-db',
    password: 'your-password',
    port: 5432,
});


// Replace the values in these variables with your Azure Redis instance information
const redisHost = 'your-redis-instance.redis.cache.windows.net';
const redisPort = 6380;
const redisPassword = 'your-redis-password';

// Create a Redis client and authenticate it
const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    tls: { servername: redisHost },
});
module.exports = { emailRegex, transporter, pool, redisClient }