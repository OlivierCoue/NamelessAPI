// server.js

var express         = require('express');
var app             = express();
var bodyParser      = require('body-parser');
var server          = require('http').Server(app);
var cors            = require('cors');
var io              = require('socket.io').listen(server);
var parameters      = require('./config/parameters.json');
var session         = require('express-session');
var authRouter		= require('./routes/authentificationRouter');
var userRouter      = require('./routes/userRouter');
var chatRouter      = require('./routes/chatRouter');
var messageRouter   = require('./routes/messageRouter');
var myEventEmitter  = require('./events/myEventEmitter');
var security 		= require('./middlewares/security');

myEventEmitter.emit('io', io);

app.use(express.static(__dirname + '/public'));
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

// ENABLE CORS
app.use(cors());

// ROUNTING
app.all('/api/*', security);
app.use('/auth', authRouter);
app.get('/', function(req, res) {
    app.use(express.static(__dirname + '/public'));
});
app.use('/api/users', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// START THE SERVER
server.listen(3000, function(){
  console.log('socket Listening port: 3000');
});
app.listen(port);
console.log("Listening to port: " + port);