var model = require('../model/updatebooking');
const { addNotification } = require('../util/notification');

module.exports.updateBookingStatus = async (req, res) => {
    try {
        const { b_id, b_status, b_u_id, view_reason } = req.body;

        if (!b_id || !b_status || !b_u_id) {
            return res.send({
                result: false,
                message: "Insufficient parameters"
            });
        }

        // if (!["approved", "rejected", "completed", "cancelled", "cancelreq", "onride",].includes(b_status)) {
        //     return res.send({
        //         result: false,
        //         message: "Invalid status value"
        //     });
        // }

        // console.log("STATUS RECEIVED:", req.body.b_status);
        const booking = await model.findBooking(b_id, b_u_id);
        if (booking.length === 0) {
            return res.send({ result: false, message: "Booking not found" });
        }

        let getadmin = await model.GetAdmin()
        let updates = [];

        if (b_status !== undefined) updates.push(`b_status='${b_status}'`);
        if (view_reason !== undefined) updates.push(`view_reason='${view_reason}'`);

        let result
        if (updates.length > 0) {
            const updateString = updates.join(', ');
            result = await model.updateBookingStatus(updateString, b_id, b_u_id);
            if (result.affectedRows == 0) {
                return res.send({
                    result: false,
                    message: "Failed to update Booking status"
                })
            }
        }

        if (result.affectedRows > 0) {
            // Send notification to user
            await addNotification(getadmin[0]?.u_id,
                b_u_id,
                "user",
                "Booking " + b_status,
                `Your booking has been ${b_status}.`,
                "unread"
            );

            return res.send({
                result: true,
                message: `Booking status updated to ${b_status}`
            });
            
        } else {
            return res.send({
                result: false,
                message: "Booking not found or status not updated"
            });
        }

    } catch (error) {
        return res.send({
            result: false,
            message: error.message
        });
    }
};
