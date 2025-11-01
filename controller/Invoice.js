const model = require("../model/invoice");
const moment = require("moment");
const nodemailer = require("nodemailer");

module.exports.Invoice = async (req, res) => {
  try {
    const { b_id } = req.body;

    if (!b_id) {
      return res.send({
        result: false,
        message: "Booking id is required",
      });
    }
    var today = moment().format('MMM_DD_YYYY')
    const bookinglist = await model.getBooking(b_id);

    if (!bookinglist || bookinglist.length === 0) {
      return res.send({
        result: false,
        message: "Booking details not found",
      });
    }

    const booking = bookinglist[0];

    if (booking.b_status?.toLowerCase() !== "completed") {
      return res.send({
        result: false,
        message: "Cannot generate Invoice. This booking is not completed.",
      });
    }

    // ✅ Email HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bike Rental Invoice</title>
<style>
  body {
    font-family: "Poppins", sans-serif;
    background-color: #f8f9fa;
    margin: 0;
    padding: 20px;
    color: #333;
  }
  .invoice-container {
    max-width: 800px;
    margin: auto;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 30px;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #2ecc71;
    padding-bottom: 10px;
    margin-bottom: 30px;
  }
  header h1 {
    color: #2ecc71;
    margin: 0;
  }
  .company-details {
    text-align: right;
  }
  .company-details h2 {
    margin: 0;
  }
  .invoice-details, .customer-details {
    margin-bottom: 20px;
  }
  .details-grid {
    display: flex;
    justify-content: space-between;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 30px;
  }
  table th, table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  table th {
    background-color: #2ecc71;
    color: white;
  }
  table tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  .total {
    text-align: right;
  }
  .total strong {
    font-size: 1.2em;
  }
  footer {
    border-top: 2px solid #2ecc71;
    text-align: center;
    padding-top: 15px;
    color: #777;
    font-size: 0.9em;
  }
  @media print {
    body {
      background: white;
    }
    .invoice-container {
      box-shadow: none;
    }
    footer {
      color: #555;
    }
  }
</style>
</head>
<body>
  <div class="invoice-container">
    <header>
      <div class="logo">
        <h1>GETBIKE</h1>
      </div>
      <div class="company-details">
        <h2>INVOICE</h2>
        <p>Date: <strong>${today}</strong></p>
      </div>
    </header>

    <section class="customer-details">
      <h3>Customer Details</h3>
      <div class="details-grid">
        <div>
          <p><strong>Name:</strong> ${booking.u_name}</p>
          <p><strong>Email:</strong> ${booking.u_email}</p>
          <p><strong>Phone:</strong> ${booking.u_mobile}</p>
          <p><strong>Address:</strong> ${booking.u_address}, ${booking.u_district},<br>${booking.u_pincode}</p>
        </div>
      </div>
    </section>

    <section class="invoice-details">
      <h3>Rental Details</h3>
      <table>
        <thead>
          <tr>
            <th>Bike Model</th>
            <th>Booking Date</th>
            <th>Rental Amount</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${booking.b_bike_name}</td>
            <td>${booking.booking_date}</td>
            <td>₹${booking.b_rent_amount}</td>
            <td><strong>₹${booking.b_price}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="total">

        <p><strong>Total Amount:₹${booking.b_price}</strong></p>
      </div>
    </section>

    <footer>
      <p>Thank you for choosing Getbike. Ride safe and enjoy your trip!</p>
      <p>For support: getbike09@gmail.com</p>
    </footer>
  </div>
</body>
</html>
`;


    // ✅ Email setup
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // ✅ Send the mail
    await transporter.sendMail({
      from: `GETBIKE <${process.env.EMAIL}>`,
      to: booking.u_email,
      subject: "Your GetBike Invoice",
      html: htmlContent,
    });

    return res.send({
      result: true,
      message: "Invoice email sent successfully.",
    });

  } catch (error) {
    console.error("Error sending invoice email:", error);
    return res.send({
      result: false,
      message: error.message,
    });
  }
};
