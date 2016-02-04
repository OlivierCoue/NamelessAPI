// server.js

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var server     = require('http').Server(app);
var io         = require('socket.io').listen(server);
var parameters = require('./config/parameters.json');
var session    = require('express-session');
var userRouter = require('./routes/userRouter');
var chatRouter = require('./routes/chatRouter');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: parameters.secret,
    name: "GATEAU",
    resave: true,
    saveUninitialized: true
}));

var port = process.env.PORT || 8080;

var router = express.Router();              

// ROUNTING
app.use('/api/users', userRouter);
app.use('/api/chat', chatRouter);

// START THE SERVER
// =======================================
app.listen(port);
console.log("Listening to port : " + port);