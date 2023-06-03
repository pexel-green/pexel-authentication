const { emailRegex, transporter } = require("./webConfig");
const { StatusCodes } = require('http-status-codes');
const redisService = require('./services/redisService');

const uuid = require('uuid');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

function isValidEmail(email) {
    return email.match(emailRegex)
}

function sendOTPMail(email, otp) {
    // Define the email message options
    const mailOptions = {
        from: 'your-email@example.com',
        to: email,
        subject: 'Your OTP code',
        text: `Your OTP code is ${otp}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);
            return {
                message: { error },
                code: StatusCodes.INTERNAL_SERVER_ERROR
            }
        } else {
            console.log('Email sent: ' + info.response);

            await redisService.set(otp, email, 60 * 60).catch(err => {
                console.log("Failed to set otp in redis")
                return {
                    message: { error: err },
                    code: StatusCodes.INTERNAL_SERVER_ERROR
                }
            })

            return {
                message: {
                    message: info.response
                },
                code: StatusCodes.OK
            }
        }
    });
}

async function isValidOTPWithCredential(otp, email) {
    const retrivedEmail = await redisService.get(otp)
    return email === retrivedEmail
}


async function generateSessionId(accessToken) {
    // Generate a UUID v4 and take the first 16 characters
    const uuidV4 = uuid.v4().slice(0, 16);
    // Concatenate the UUID v4 and the access token
    await redisService.set(uuidV4, accessToken, 60 * 60 * 12 * 30)
    return uuidV4;
}

module.exports = { generateOTP, isValidEmail, sendOTPMail, isValidOTPWithCredential, generateSessionId };