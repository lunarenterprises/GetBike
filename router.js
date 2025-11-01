var express = require("express");
var route = express.Router();

var { login } = require('./controller/login')
route.post('/login', login)

var { Register } = require('./controller/registartion')
route.post('/register', Register)

var { forgotpassword } = require('./controller/forgetpassword')
route.post('/forgotpassword', forgotpassword)

var { ResetPassword } = require('./controller/forgetpassword')
route.post('/changepassword', ResetPassword)

var { verifyOtp } = require('./controller/forgetpassword')
route.post('/verifyOtp', verifyOtp)

var { addbike } = require('./controller/addbike')
route.post('/add/bike', addbike)

var { listbike } = require('./controller/addbike')
route.post('/list/bike', listbike)

var { deleteBikes } = require('./controller/addbike')
route.post('/delete/bike', deleteBikes)

var { editbikes } = require('./controller/addbike')
route.post('/edit/bike', editbikes)

var { bookings } = require('./controller/booking')
route.post('/add/booking', bookings)

var { RazorpayCallback } = require('./controller/razorpaycallback')
route.get('/razorpay/callback', RazorpayCallback)

var { cancelBooking } = require('./controller/cancelbooking')
route.post('/cancel/booking', cancelBooking)

var { EditPersonalInfo } = require('./controller/editprofile')
route.post('/edit/profile', EditPersonalInfo)

var { ContactUs } = require('./controller/contact')
route.post('/add/contact', ContactUs)

var { listcontact } = require('./controller/contact')
route.post('/list/contact', listcontact)

var { deletecontact } = require('./controller/contact')
route.post('/delete/contact', deletecontact)

var { documents } = require('./controller/documents')
route.post('/add/document', documents)

var { updateBookingStatus } = require('./controller/updatebooking')
route.post('/update/status', updateBookingStatus)

var { listbooking } = require('./controller/booking')
route.post('/list/booking', listbooking)

var { listNotification } = require('./controller/listnotification')
route.post('/list/notification', listNotification)

var { reviewadd } = require('./controller/review')
route.post('/add/review', reviewadd)

var { listUser,listAdmincontact } = require('./controller/listUser')
route.post('/list/user', listUser)
route.post('/list/contacts', listAdmincontact)

var { deleteUser } = require('./controller/listUser');
route.post('/deleteUser', deleteUser);

var { extendbooking } = require('./controller/booking');
route.post('/extend/booking', extendbooking);

var { addbikecenter } = require('./controller/bikeceneter')
route.post('/add/center', addbikecenter)

var { listcenter } = require('./controller/bikeceneter');
route.post('/list/center', listcenter)

var{deletecenter}=require('./controller/bikeceneter')
route.post('/delete/center',deletecenter)

var {editcenter}=require('./controller/bikeceneter')
route.post('/edit/center',editcenter)

var{verifyOtp}=require('./controller/registartion')
route.post('/register/verifyOtp',verifyOtp)

var{Invoice}=require('./controller/Invoice')
route.post('/booking/invoice',Invoice)

module.exports = route

