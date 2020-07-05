const mysql = require("mysql");

const connection = mysql.createConnection({
    host:"localhost",
    post: 3306,
    user: "root",
    password : "myroot7",
    database : "employees_db"

});

connection.connect((err) => {
    if(err) throw err;
    //console.log("Connected as " + connection.threadId);
});

module.exports = connection;