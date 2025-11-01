var db = require("../config/db");
var util = require("util")
const query = util.promisify(db.query).bind(db);
var nodemailer = require('nodemailer')
var { transporter } = require("../util/mailer");


module.exports.RazorpayCallback = async (req, res) => {

    let booking_id = req.query.booking_id
    let getUser
    let getBike
    if (req.query.razorpay_payment_link_status == 'paid') {

        let updateOrder = await UpdateBookingChange(booking_id)

        if (updateOrder.affectedRows > 0) {
            let status = 'Paid'
            let updatePayment = await UpdatePaymentChange(booking_id, status)

            let booking = await getBooking(booking_id)

            getUser = await GetUser(booking[0]?.b_u_id)

            getBike = await GetBike(booking[0]?.b_bk_id)

            await transporter.sendMail({
                from: `GETBIKE <${process.env.EMAIL}>`,
                to: getUser[0]?.u_email,
                subject: "MESSAGE FROM GETBIKE",
                html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bike Rental Payment Success</title>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f0f2f5;
        margin: 0;
        padding: 20px;
    }
    .email-container {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        text-align: center;
        padding: 30px 20px;
    }
    .header img {
        width: 60px;
        margin-bottom: 15px;
    }
    .header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 600;
    }
    .content {
        padding: 30px 20px;
        color: #333333;
    }
    .content h2 {
        color: #2575fc;
        font-size: 22px;
        margin-top: 0;
    }
    .content p {
        font-size: 16px;
        line-height: 1.6;
    }
    .details {
        margin: 25px 0;
        border-collapse: collapse;
        width: 100%;
        font-size: 15px;
    }
    .details th, .details td {
        text-align: left;
        padding: 12px 10px;
        border-bottom: 1px solid #eee;
    }
    .details th {
        background-color: #f7f7f7;
        font-weight: 600;
    }
    .total {
        font-weight: bold;
        font-size: 16px;
        text-align: right;
    }
    .button {
        display: inline-block;
        padding: 12px 25px;
        background-color: #00bfa5;
        color: white !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin-top: 20px;
    }
    .footer {
        background-color: #f9f9f9;
        text-align: center;
        padding: 20px;
        font-size: 13px;
        color: #777;
    }
    @media (max-width: 620px) {
        .content, .header {
            padding: 20px;
        }
        .header h1 {
            font-size: 22px;
        }
        .content h2 {
            font-size: 20px;
        }
        .button {
            padding: 12px 20px;
        }
    }
</style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success">
            <h1>Payment Successful!</h1>
        </div>
        <div class="content">
            <h2>Hi ${getUser[0]?.u_name},</h2>
            <p>Your payment for the bike rental has been successfully received. Your booking is now confirmed and ready for your ride.</p>

            <table class="details">
                <tr>
                    <th>Bike Name</th>
                    <td>${getBike[0]?.b_name}</td>
                </tr>
                <tr>
                    <th>Rental Date</th>
                    <td>${booking[0]?.b_pickup_date}</td>
                </tr>
                <tr>
                    <th>Duration</th>
                    <td>${booking[0]?.b_drop_date}</td>
                </tr>
                <tr>
                    <th>Bike Rent</th>
                    <td>${booking[0]?.b_rent_amount}</td>
                </tr>
                <tr>
                    <th>Total Paid</th>
                    <td>${booking[0]?.b_price}</td>
                </tr>
            </table>

            <p class="total">Thank you for choosing us! Enjoy your ride.</p>
            
        </div>
        <div class="footer">
            <p>If you have any questions, contact us at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a></p>
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
            });

            // return res.redirect('https://lozara.shop/');

            return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Successful</title>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }
    .success-container {
        background-color: #fff;
        max-width: 500px;
        width: 100%;
        border-radius: 15px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        text-align: center;
        padding: 40px 20px;
        animation: fadeIn 1s ease-in-out;
    }
    @keyframes fadeIn {
        from {opacity: 0; transform: translateY(-20px);}
        to {opacity: 1; transform: translateY(0);}
    }
    .success-icon {
        width: 80px;
        margin-bottom: 20px;
    }
    h1 {
        color: #28a745;
        font-size: 28px;
        margin: 0 0 10px 0;
    }
    p {
        font-size: 16px;
        color: #555;
        margin: 5px 0 20px 0;
    }
    .details {
        background-color: #f7f7f7;
        border-radius: 10px;
        padding: 20px;
        text-align: left;
        margin-bottom: 25px;
    }
    .details p {
        margin: 10px 0;
        font-size: 15px;
    }
    .details span {
        font-weight: bold;
        color: #333;
    }
    .buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
    }
    .btn {
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        color: #fff;
        transition: 0.3s;
        border: none;
        cursor: pointer;
        font-size: 16px;
    }
    .btn-primary {
        background: linear-gradient(135deg, #6a11cb, #2575fc);
    }
    .btn-secondary {
        background: #28a745;
    }
    .btn:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
    .btn:active {
        transform: translateY(0);
    }
    .app-open-info {
        margin-top: 15px;
        font-size: 14px;
        color: #666;
        font-style: italic;
    }
    @media (max-width: 480px) {
        .success-container {
            padding: 30px 15px;
        }
        h1 {
            font-size: 24px;
        }
        .btn {
            width: 100%;
            text-align: center;
        }
    }
</style>
</head>
<body>
    <div class="success-container">
        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success" class="success-icon">
        <h1>Payment Successful!</h1>
        <p>Thank you, ${getUser[0]?.u_name}. Your bike rental booking is confirmed.</p>

        <div class="details">
            <p>🚲 <span>Bike Name:</span> ${getBike[0]?.b_name}</p>
            <p>📅 <span>Rental Date:</span> ${booking[0]?.b_pickup_date}</p>
            <p>⏳ <span>Duration:</span> ${booking[0]?.b_drop_date}</p>
            <p>💰 <span>Total Paid:</span> ${booking[0]?.b_price}</p>
        </div>

        <div class="buttons">
            <button class="btn btn-primary" onclick="openApp()">
                📱 Continue to App
            </button>
        </div>
        
        <p class="app-open-info">Tap the button above to view your booking in the GetBike app</p>
    </div>

    <script>
        function openApp() {
            // Deep link to open the app and navigate to MyBookings page
            const deepLink = "getbike://payment_return?status=success&user_id=${getUser[0]?.u_id}&bike_id=${getBike[0]?.b_id}";
            
            // Try to open the app
            window.location.href = deepLink;
            
            // Fallback: If app is not installed, show message after a delay
            setTimeout(function() {
                if (!document.hidden) {
                    alert('GetBike app not found. Please make sure the app is installed on your device.');
                }
            }, 2000);
        }

        // Alternative: Auto-try to open app on page load (optional)
        // window.onload = function() {
        //     setTimeout(openApp, 1000);
        // };
    </script>
</body>
</html>`)

        }
    } else {
        await DeleteOrder(booking_id)
        let status = 'Failed'
        let updatePayment = await UpdatePaymentChange(booking_id, status)

        return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Failed</title>
<style>
    body {
        font-family: 'Poppins', sans-serif;
        background-color: #fff5f5;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }
    .container {
        background-color: #ffffff;
        max-width: 520px;
        width: 100%;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        text-align: center;
        padding: 40px 25px;
        animation: popIn 0.8s ease forwards;
    }
    @keyframes popIn {
        from {opacity: 0; transform: scale(0.95);}
        to {opacity: 1; transform: scale(1);}
    }
    .icon {
        width: 80px;
        margin-bottom: 20px;
    }
    h1 {
        font-size: 26px;
        color: #e53935;
        margin-bottom: 10px;
    }
    p {
        font-size: 16px;
        color: #555555;
        margin-bottom: 25px;
        line-height: 1.6;
    }
    .details {
        background-color: #ffecec;
        padding: 20px;
        border-radius: 12px;
        text-align: left;
        margin-bottom: 30px;
    }
    .details p {
        margin: 8px 0;
        font-size: 15px;
    }
    .details span {
        font-weight: 600;
        color: #333;
    }
    .buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
    }
    .btn {
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        color: #fff;
        transition: 0.3s;
        border: none;
        cursor: pointer;
        font-size: 16px;
    }
    .btn-primary {
        background: linear-gradient(135deg, #6a11cb, #2575fc);
    }
    .btn-secondary {
        background: #28a745;
    }
    .btn:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
    .btn:active {
        transform: translateY(0);
    }
    .app-open-info {
        margin-top: 15px;
        font-size: 14px;
        color: #666;
        font-style: italic;
    }
    @media (max-width: 480px) {
        .container {
            padding: 30px 20px;
        }
        .btn {
            width: 100%;
            text-align: center;
        }
    }
</style>
</head>
<body>
    <div class="container">
        <img src="https://cdn-icons-png.flaticon.com/512/1828/1828665.png" alt="Failed" class="icon">
        <h1>Payment Not Completed</h1>
        <p>Unfortunately, we were unable to process your payment. Don’t worry — you can try again or reach out to our support team for help.</p>

        <div class="details">
            <p>🚲 <span>Bike:</span> ${bikeName}</p>
            <p>📅 <span>Rental Date:</span> ${rentalDate}</p>
            <p>⏳ <span>Duration:</span> ${rentalDuration}</p>
            <p>💰 <span>Amount:</span> ${paymentAmount}</p>
        </div>
<div class="buttons">
            <button class="btn btn-primary" onclick="openApp()">
                📱 Continue to App
            </button>
        </div>

    </div>

    <script>
        function openApp() {
            // Deep link to open the app and navigate to MyBookings page
            const deepLink = "getbike://payment_return?status=failed&&user_id=${getUser[0]?.u_id}&bike_id=${getBike[0]?.b_id}";
            
            // Try to open the app
            window.location.href = deepLink;
            
            // Fallback: If app is not installed, show message after a delay
            setTimeout(function() {
                if (!document.hidden) {
                    alert('GetBike app not found. Please make sure the app is installed on your device.');
                }
            }, 2000);
        }

        // Alternative: Auto-try to open app on page load (optional)
        // window.onload = function() {
        //     setTimeout(openApp, 1000);
        // };
    </script>
</body>
</html>
`)
    }
}

async function DeleteOrder(booking_id) {
    var Query = `delete from bookings where b_id = ?`;
    var data = await query(Query, [booking_id]);
    return data;
};

async function UpdateBookingChange(booking_id) {
    var Query = `update bookings set b_payment_status = ? where b_id = ?`;
    var data = await query(Query, ['paid', booking_id]);
    return data;
};

async function UpdatePaymentChange(ph_booking_id, status) {
    var Query = `update paymentHistory set ph_status = ? where ph_booking_id = ?`;
    var data = await query(Query, [status, ph_booking_id]);
    return data;
};

async function getBooking(booking_id) {
    var Query = `select * from bookings where b_id = ?`;
    var data = await query(Query, [booking_id]);
    return data;
};

async function GetUser(user_id) {
    var Query = `select * from user where u_id = ?`;
    var data = await query(Query, [user_id]);
    return data;
};

async function GetBike(b_id) {
    var Query = `select * from bikes where b_id = ?`;
    var data = await query(Query, [b_id]);
    return data;
};