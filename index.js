const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const { isValidEmail, generateOTP, sendOTPMail, isValidOTPWithCredential } = require('./utils');
const userService = require('./services/userService');
const redisService = require('./services/redisService');
const jwtService = require('./services/jwtService');

// Create express app
const app = express();

// Configure body-parser middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Enable CORS for all routes
app.use(cors());

// Define routes
app.post('/send-email-otp', (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email is required' });
    }
    if (!isValidEmail(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid email format' });
    }
    const { code, message } = sendOTPMail(email, generateOTP())
    return res.status(code).json(message)
});

app.post("login-email-otp", async (req, res) => {
    const { email, otp } = req.body
    if (!email || !otp) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Credentials is required' });
    }
    if (!isValidEmail(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid email format' });
    }
    try {
        if (await isValidOTPWithCredential(otp, email)) {
            return await userService.loginWithEmail(req, res)
        }
        throw new Error(`Validation Failed`);
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
})


app.post('/authenticate-sessionId', async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Not authenticated' });
    }
    const accessToken = await redisService.get(sessionId)
    if (!accessToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Not authenticated' });
    }

    const user = jwtService.verifyAndDecodeAccessToken(accessToken)
    if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Not authenticated' });
    }
    return res.status(StatusCodes.OK).json({ message: user });
});

app.post("log-off", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Not authenticated' });
        }
        await redisService.remove(sessionId)
        return res.status(StatusCodes.OK).json({ message: "Log-off success" })
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(error)
    }
})


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

