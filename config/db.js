var mysql =require("mysql");
//initialize pool
var pool = mysql.createPool({
    connectionLimit:10,
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_USERNAME,
    connectTimeout: 30000 , // <-- 30 seconds timeout
    dateStrings: true
});
pool.getConnection((err,connection)=>{
    if (err)throw err;
    console.log("connected to Mysqldatabase");
    connection.release();
});
module.exports=pool;

