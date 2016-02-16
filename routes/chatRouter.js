// /routes/chatRouter.js

var express         = require('express');
var ent             = require('ent');
var User            = require('../models/user');
var MessageThread   = require('../models/messageThread');
var states          = require('../config/states.json');
var myEventEmitter  = require('../events/myEventEmitter');

var router = express.Router();

var io = null;

myEventEmitter.on('io', function(ioInstance){
    io = ioInstance;

    io.sockets.on('connection', function (socket) {
        console.log('New user connected !');
        console.log('ID :  '+socket.id);
        io.to(socket.id).emit('connect_success', {socketId: socket.id});

        socket.on('disconnect', function() {            
            User.closeBySocketId(socket.id, function(rows){
                console.log('User disconnect! -> CLOSED');
            })
        });
    });    
});

/**
* ROUTE FOR /api/chat/start
*/
router.route('/hello')
    /* GET
    */
    .get(function(req, res) {
        console.log("Hello, wellcome to the api !");
        res.json({message: "Hello, wellcome to the api !"});
    });

/**
* ROUTE FOR /api/chat/count
*/
router.route('/count')
    /* GET
    * count users in chosen range
    * @param    float    lat
    *           float    long
    *           int      range
    */
    .get(function(req, res) {        
        if(typeof(req.query.range) == 'undefined' || typeof(req.query.lat) == 'undefined' || typeof(req.query.long) == 'undefined'){
            res.json({message: "bad params"});
            res.end();
            return;
        }else{
            User.countInRange(parseFloat(req.query.lat), parseFloat(req.query.long), parseInt(req.query.range), function(count){
                res.json({friendNb: count[0].friendNb});
            })
        }
    });

/**
* ROUTE FOR /api/chat/start
*/
router.route('/start')
    /* POST
    * create user -> find someone to speak with -> found ? create messageThread : return user
    * @param    String    username
    *           String    socketId
    *           float     lat
    *           float     long
    *           int       range
    */
    .post(function(req, res) {       
        if(typeof(req.body.range) == 'undefined' || typeof(req.body.lat) == 'undefined' || typeof(req.body.long) == 'undefined' || typeof(req.body.username) == 'undefined' || typeof(req.body.socketId) == 'undefined'){
            res.json({message: "bad params"});
            res.end();
            return;
        }else{
            var now = new Date();
            var currentUser = new User({
                username: ent.encode(req.body.username),
                state: states.SEARCHING,
                searchRange: parseInt(req.body.range),
                geoPoint: {x: parseFloat(req.body.lat), y: parseFloat(req.body.long)},                                       
                socketId: req.body.socketId,
                createdDate: now.toISOString().substring(0, 10) + " " + now.toISOString().substring(11, 23)
            });
            /* create user in db */
            currentUser.create(function(newUser){
                req.session.userId = newUser.get("id");
                currentUser = newUser;
                /* search someone to speak with */
                currentUser.findFriend(function(friend){
                    /* if found */
                    if(friend.get("id") != null && friend.get("id") != ""){
                        createConversation(currentUser, friend, function(currentUser, friend, messageThread){
                            res.json({found: true, currentUser: currentUser, friend: friend, messageThread: messageThread});
                            io.to(friend.get("socketId")).emit('friend_founded', {found: true, currentUser: friend, friend: currentUser, messageThread: messageThread});
                        });
                    }
                    /* if not found */
                    else{                        
                        res.json({found: false, currentUser: currentUser});
                    }
                });
            });
        }
    });

/**
* ROUTE FOR /api/chat/next
*/
router.route('/next')
    /* GET
    * find someone to speak with -> found ? create messageThread : change user state to SEARCHING return user
    */
    .get(function(req, res) {
        var sess=req.session;        
        if(typeof(sess.userId) == 'undefined'){
            res.json({message: "no session"});
            res.end();
            return;
        }else{
            /* get the current user by id */
            User.findById(sess.userId, function(currentUser){                            

                /* send quit event to ex friend if chatting */                
                emitQuitEvent(currentUser, "next", function(){});

                currentUser.findFriend(function(friend){
                    /* if found */
                    if(friend.get("id") != null && friend.get("id") != ""){
                        createConversation(currentUser, friend, function(currentUser, friend, messageThread){
                            res.json({found: true, currentUser: currentUser, friend: friend, messageThread: messageThread});
                            io.to(friend.get("socketId")).emit('friend_founded', {found: true, currentUser: friend, friend: currentUser, messageThread: messageThread});
                        });
                    }
                    /* if not found */
                    else{
                        currentUser.set("state", states.SEARCHING);
                        currentUser.save(function(currentUser){
                            res.json({found: false, currentUser: currentUser});
                        });
                    }
                });
            });
        }
    });

/**
* ROUTE FOR /api/chat/stop
*/
router.route('/stop')
    /* POST
    * set the currentUser's state to closed and delete de session userId   
    */
    .post(function(req, res) {
        var sess=req.session;
        if(typeof(sess.userId) == 'undefined'){
            res.json({message: "no session"});
            res.end();
            return;
        }else{
            var currentUser = User.findById(sess.userId, function(currentUser){
                /* send quit event to ex friend if chatting */                
                currentUser.set("state", states.CLOSED);
                currentUser.save(function(){
                    emitQuitEvent(currentUser, "stop", function(){});
                    res.json({message: "session closed"});
                });
            });
            sess.userId = undefined;
        }
    });


function emitQuitEvent(currentUser, reason, callback){    
    currentUser.getMessageThread(function(messageThread){
        messageThread.getRecipient(currentUser, function(recipient){
            var recipient = new User(recipient);
            io.to(recipient.get("socketId")).emit('friend_quit', {reason: reason});
            console.log(recipient.get("socketId") + "   ----->   " + reason);
            callback();
        });
    });    
}

function createConversation(currentUser, friend, callback){
    var messageThread = new MessageThread({
        createdDate: new Date(),
        updatedDate: new Date()
    });
    messageThread.create(function(messageThread){
        messageThread.addUser(currentUser, function(currentUser){
            callback(currentUser, friend, messageThread);
        });
        messageThread.addUser(friend, function(friend){});
    });
}

// Export module
module.exports = router;