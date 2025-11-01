var db =require('../config/db');
var util =require("util");
const query = util.promisify(db.query).bind(db);

module.exports.CheckMail = async (email) => {
    var Query = `select * from user where u_email =?`;
    var data = query(Query, [email]);
    return data;
}

module.exports.AddUser= async (name, email,hashedpasssword, mobile, date,token,tokenExpiry) => {
    var Query = `insert into user(u_name,u_email,u_password,u_mobile,u_joindate,u_token,u_token_expiry)values(?,?,?,?,?,?,?)`;
    var data = await query(Query, [name, email,hashedpasssword, mobile, date,token,tokenExpiry])
    return data;
}
module.exports.checkmobile=async(mobile)=>{
     var Query = `select * from user where u_mobile=? `;
    var data = query(Query, [mobile]);
    return data;

}
module.exports.updateOtpStatus =async (email,status)=>{
    var Query=`update user set u_otp_status=? where u_email=?`;
    var  data =await query(Query,[status,email])
    return data;
}
module.exports.ValidateResetToken =async(email,otp)=>{
    var Query= `select * FROM user WHERE u_email=? AND u_token=? AND u_otp_status='unverified' `;
    var data =await query(Query,[email,otp]);
    return  data;
};
module.exports.updateemail = async (email, u_mobile_verify) => {
    var Query = `UPDATE user SET u_mobile_verify = ? WHERE u_email = ?`;
    var data = await query(Query, [u_mobile_verify, email]);
    return data;
};

module.exports.deleteUserQuery = async (mobile) => {
    var Query = `DELETE FROM user WHERE u_mobile = ?`;
    var data = await query(Query, [mobile]);
    return data;
};