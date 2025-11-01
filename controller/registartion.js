var model = require('../model/registration');
var moment = require("moment");
var bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

module.exports.Register = async (req, res) => {
    try {
        var { name, email, password, mobile, role } = req.body
        if (!name || !email || !password || !mobile || !role) {
            return res.send({
                result: false,
                message: "insufficient parameter"
            })
        }
        var date = moment().format('YYYY-MM-DD')
        const checkmail = await model.CheckMail(email);

        let checkmobile = await model.checkmobile(mobile);

        if (checkmail[0]?.verify_email == false) {
            let deleteuser = await model.deleteUserQuery(email)
        }
        if (checkmail[0]?.verify_email == true) {

            if (checkmobile.length > 0) {
                return res.send({
                    result: false,
                    message: "phone number already registerd "
                });

            }

            return res.send({
                result: false,
                message: "email already registerd "
            });
        }


        var hashedpasssword = await bcrypt.hash(password, 10);
        var otp = Math.floor(1000 + Math.random() * 9000);
        var otpExpiry = moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        let adduser = await model.AddUser(name, email, hashedpasssword, mobile, date, otp, otpExpiry, role);

        const userId = adduser.insertId;

        // Send OTP email

        let transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 587,
            auth: {
                type: 'Custom',
                method: 'PLAIN',
                user: 'support@choiceglobal.in',
                pass: 'support123abcAB@',
            },
        });
        let infos = await transporter.sendMail({
            from: "getbike<support@choiceglobal.in>",
            to: email,
            subject: "Registration OTP",
            html: `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Change Password Email</title>
                      <style>
                          body {
                              font-family: Arial, sans-serif;
                              background-color: #f4f4f4;
                              margin: 0;
                              padding: 20px;
                          }
                          .container {
                              background-color: #ffffff;
                              padding: 20px;
                              border-radius: 5px;
                              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                              max-width: 600px;
                              margin: auto;
                          }
                          h1 {
                              color: #333;
                          }
                          p {
                              color: #555;
                          }
                          .button {
                              background-color: #007bff;
                              color: white;
                              padding: 10px 15px;
                              text-decoration: none;
                              border-radius: 5px;
                              display: inline-block;
                          }
                          .button:hover {
                              background-color: #0056b3;
                          }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <h1>OTP for registration</h1>
                          <p>We received a request for user registration. If you did not request this, please ignore this email.</p>
                          <h1>${otp}</h1>
                          <p>This is your OTP to change the password</p>
                          <p>This OTP will expire in 5 minutes</p>
                          <p>Thank you!</p>
                      </div>
                  </body>
                  </html>
                  
                  `
        });

        return res.send({
            result: true,
            message: "registerd  successfully",
        })

    } catch (error) {
        console.log(error);

        return res.send({
            result: false,
            message: error.message
        })
    }

}

module.exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).send({
                result: false,
                message: "Email and OTP are required"
            });
        }

        const tokenInfo = await model.ValidateResetToken(email, otp);

        if (!tokenInfo || tokenInfo.length === 0) {
            return res.status(400).send({
                result: false,
                message: "Invalid OTP"
            });
        }

        const tokenExpiry = moment(tokenInfo[0].u_token_expiry);

        if (moment().isAfter(tokenExpiry)) {
            return res.status(400).send({
                result: false,
                message: "OTP has expired"
            });
        }

        await model.updateOtpStatus(email, "verified");
        await model.updateemail(email, "true")

        return res.send({
            result: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).send({
            result: false,
            message: "Internal server error"
        });
    }
};