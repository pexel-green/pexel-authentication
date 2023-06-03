const { promisify } = require('util');
const { redisClient } = require('../webConfig');
// Promisify the Redis client methods
const getAsync = promisify(redisClient.get).bind(redisClient);
const setexAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Define the Redis service object
const redisService = {};

// Define the function for setting data in Redis
redisService.set = async function (key, value, expireSeconds) {
    await setexAsync(key, expireSeconds, value);
};

// Define the function for getting data from Redis
redisService.get = async function (key) {
    return await getAsync(key);
};

// Define the function for removing data from Redis
redisService.remove = async function (key) {
    await delAsync(key);
};

// Export the Redis service object
module.exports = redisService;