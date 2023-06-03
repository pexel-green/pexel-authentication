const jwt = require('jsonwebtoken');

// Define the secret key for signing and verifying the JWT tokens
const jwtSecret = 'your-jwt-secret';

// Define the JWT token service object
const jwtService = {};

// Define the function for generating a JWT access token
jwtService.generateAccessToken = function (user) {
    // Create a JWT payload with the user information
    const payload = { id: user.id, email: user.email };
    // Generate a JWT access token with the payload and secret key
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '30d' });
    return token;
};

// Define the function for verifying a JWT access token
jwtService.verifyAndDecodeAccessToken = function (token) {
    try {
        // Verify the JWT access token with the secret key
        const decoded = jwt.verify(token, jwtSecret);
        // Return the decoded payload
        return decoded;
    } catch (error) {
        // Throw an error if the JWT access token is invalid
        throw new Error('Invalid JWT token');
    }
};

// Export the JWT token service object
module.exports = jwtService;