var model = require('../model/booking');
var moment = require("moment");
const notify = require('../util/notification');
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
const axios = require("axios");

module.exports.bookings = async (req, res) => {
    try {
        const form = new formidable.IncomingForm({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.send({
                    result: false,
                    message: "File upload failed!",
                    error: err.message,
                });
            }

            let {
                user_id,
                user_name,
                user_email,
                user_mobile_no,
                bike_name,
                bike_id,
                pickup_location,
                pickup_date,
                pickup_time,
                drop_location,
                drop_date,
                drop_time,
                adharcardfront,
                adharcardback,
                licensefront,
                licenseback,
                amount,
                rent_amount
            } = fields;

            // 1️⃣ Validate required fields
            if (
                !user_id ||
                !bike_id ||
                !bike_name ||
                !pickup_location ||
                !pickup_date ||
                !pickup_time ||
                !drop_location ||
                !drop_date ||
                !drop_time ||
                !adharcardfront ||
                !adharcardback ||
                !licensefront ||
                !licenseback ||
                !amount
            ) {
                return res.send({
                    result: false,
                    message: "Insufficient parameters",
                });
            }

            // 2️⃣ Check if user exists
            const checkUser = await model.CheckUser(user_id);
            if (!checkUser || checkUser.length === 0) {
                return res.send({ result: false, message: "User not found" });
            }

            // 3️⃣ Check if bike exists and available
            const checkBike = await model.CheckBike(bike_id);
            if (!checkBike || checkBike.length === 0) {
                return res.send({ result: false, message: "Bike not found" });
            }

            // 4️⃣ Prepare booking
            const invoice =
                "INV" + moment().format("YYYYMMDD") + Math.floor(1000 + Math.random() * 9000);
            const booking_date = moment().format("YYYY-MM-DD");

            const booking = await model.Addbooking(
                user_id,
                bike_name,
                bike_id,
                amount,
                rent_amount,
                pickup_location,
                pickup_date,
                pickup_time,
                drop_location,
                drop_date,
                drop_time,
                booking_date,
                invoice,
                adharcardfront,
                adharcardback,
                licensefront,
                licenseback
            );

            if (booking.affectedRows === 0) {
                return res.send({ result: false, message: "Booking could not be created" });
            }

            const booking_id = booking.insertId;

            // 5️⃣ Handle selfie upload
            if (files && files.selfie) {
                const imageFiles = Array.isArray(files.selfie) ? files.selfie : [files.selfie];

                for (const file of imageFiles) {
                    if (!file?.filepath || !file?.originalFilename) continue;

                    const newPath = path.join(process.cwd(), "/uploads/booking", file.originalFilename);
                    fs.writeFileSync(newPath, fs.readFileSync(file.filepath));

                    const selfiePath = "/uploads/booking/" + file.originalFilename;
                    await model.AddBookingImageQuery(selfiePath, booking_id);
                }
            }

            // 6️⃣ Create Razorpay payment link
            //live api key

            // const key_id = process.env.RZP_TEST_KEY_ID;
            // const key_secret = process.env.TEST_KEY_SECRET;

            //test api key

            const key_id = process.env.RZP_TEST_KEY_ID;
            const key_secret = process.env.RZP_TEST_KEY_SECRET;

            const callback_url = `https://lunarsenterprises.com:6032/getbike/razorpay/callback?booking_id=${booking_id}`;
            const authHeader = { auth: { username: key_id, password: key_secret } };

            const paymentLinkData = {
                amount: Number(amount) * 100,
                currency: "INR",
                description: "Payment for rent bike",
                customer: {
                    name: checkUser[0]?.u_name,
                    email: checkUser[0]?.u_email,
                    phone: checkUser[0]?.u_mobile,
                },
                callback_url,
            };

            let paymentLink;
            try {
                const response = await axios.post(
                    "https://api.razorpay.com/v1/payment_links",
                    paymentLinkData,
                    authHeader
                );
                paymentLink = response.data.short_url;
            } catch (error) {
                console.error("Error creating payment link:", error.response?.data || error.message);
                return res.send({ result: false, message: "Failed to generate payment link" });
            }

            // 7️⃣ Send notification
            const getAdmin = await model.GetAdmin();
            const bikeImagePath = await model.getOneBikeImage(bike_id);
            const notification_image = bikeImagePath[0]?.image_path || null;

            let addpaymenthistory = await model.AddPaymentHistory(user_id,booking_id, bike_id, amount, rent_amount, booking_date)

            if (addpaymenthistory.affectedRows > 0) {

                await notify.addNotification(
                    user_id,
                    getAdmin[0]?.u_id,
                    "user",
                    "Booking",
                    "you successfully booked a ride",
                    "unread",
                    notification_image
                );

                // 8️⃣ Return success response
                return res.send({
                    result: true,
                    message: "you successfully booked a ride,wait for conformation",
                    booking_id,
                    paymentLinkUrl: paymentLink,
                });

            } else {
                return res.send({
                    result: false,
                    message: "Failed to add payment history",
                });
            }
        });
    } catch (error) {
        console.error(error);
        return res.send({ result: false, message: error.message });
    }
};


module.exports.listbooking = async (req, res) => {
    try {
        let { user_id } = req.body || {}
        var condition = ''

        if (user_id) {
            condition = `where b.b_u_id ='${user_id}'`
        }
        let listbooking = await model.listbookingQuery(condition);
        if (listbooking.length > 0) {
            let getbooking = await Promise.all(
                listbooking.map(async (el) => {
                    let bike_id = el.b_bk_id
                    let bikeImagePath = await model.getOneBikeImage(el.b_bk_id);
                    el.bikeImagePath = bikeImagePath
                    return el
                }))

            return res.send({
                result: true,
                message: "data retrived",
                list: getbooking
            });

        } else {
            return res.send({
                result: false,
                message: "data not found"
            })
        }
    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });


    }
}

module.exports.extendbooking = async (req, res) => {
    try {
        let { b_id, new_drop_date, new_drop_time, new_drop_location, extend_reason } = req.body;
        if (!b_id || !new_drop_date || !new_drop_time || !new_drop_location) {

            return res.send({
                result: false,
                message: "insufficent parameter"
            })
        }
        let booking = await model.getUserIdByBooking(b_id);
        if (booking.length == 0) {
            return res.send({
                result: false,
                message: "Booking not found "
            });
        }

        let user_id = booking[0].b_u_id

        const result = await model.extendbookingQuery(b_id, new_drop_date, new_drop_time, new_drop_location, extend_reason);

        if (result.affectedRows > 0) {
            let getadmin = await model.GetAdmin();


            await notify.addNotification(
                user_id,                       // sender (user)
                getadmin[0]?.u_id,             // receiver (admin)
                "user",
                "Booking Extended",
                `Booking #${b_id} extended until ${new_drop_date} ${new_drop_time} at ${new_drop_location}`,
                "unread"
            );

            return res.send({
                result: true,
                message: "Booking extended successfully & notifications sent",
                updated: {
                    drop_date: new_drop_date,
                    drop_time: new_drop_time,
                    drop_location: new_drop_location,
                    extend_reason: extend_reason,
                    status: "extended"
                }
            });

        }
        else {
            return res.send({
                result: false,
                message: "Booking not found or not updated"
            });
        }


    } catch (error) {

        return res.send({
            result: false,
            message: error.message,
        });
    }

}




