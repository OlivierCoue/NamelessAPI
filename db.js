// /dbFunction/db.js

var mysql      = require('mysql');
var parameters = require('./config/parameters.json');

var connection = mysql.createConnection({
    host     : parameters.host,
    user     : parameters.user,
    password : parameters.password,
    port  	 : parameters.port,
    database : parameters.database
});

connection.connect(function(err) {
    if (err) {
    console.error('error connecting: ' + err.stack);
    return;
}});

module.exports = connection;