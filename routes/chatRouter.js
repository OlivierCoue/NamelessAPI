// /routes/chatRouter.js

var express         = require('express');
var User            = require('../models/user');
var MessageThread   = require('../models/messageThread');
var states          = require('../config/states.json');
var ent             = require('ent');
var myEventEmitter  = require('../events/myEventEmitter');

var router = express.Router();

var io = null;

myEventEmitter.on('io', function(ioInstance){
    io = ioInstance;

    io.sockets.on('connection', function (socket) {
        console.log('New user connected !');
        console.log('ID :  '+socket.id);
        io.to(socket.id).emit('connect_success', {socketId: socket.id});
    });

})



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
* ROUTE FOR /api/chat/start
*/
router.route('/start')
    /* POST
    * create user -> find someone to speak with -> found : create messageThread | notFound : return user 
    * @param    String    username
    *           String    socketId
    */
    .post(function(req, res) {
        if(typeof(req.body.username) == 'undefined' && typeof(req.body.socketId) == 'undefined'){
            res.json({message: "bad params"});
            res.end();
            return;
        }else{
            var currentUser = new User({
                username: ent.encode(req.body.username),
                state: states.SEARCHING,
                createdDate: new Date(),
                socketId: req.body.socketId
            });
            /* create user in db */
            currentUser.create(function(newUser){
                req.session.userId = newUser.get("id");
                currentUser = newUser;
                /* search someone to speak with */
                User.findFriend(currentUser.get("id"), function(friend){
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
    * find someone to speak with -> found : create messageThread | notFound : change user state to SEARCHING return user
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

                User.findFriend(currentUser.get("id"), function(friend){
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
                emitQuitEvent(currentUser, "stop", function(){});

                currentUser.set("state", states.CLOSED);
                currentUser.save(function(){
                });
                sess.userId = undefined;
                res.json({message: "session closed"});
            });
        }
    });


function emitQuitEvent(currentUser, reason, callback){
    if(currentUser.get("state") == states.CHATTING){
        currentUser.getMessageThread(function(messageThread){
            messageThread.getRecipient(currentUser, function(recipient){
                var recipient = new User(recipient);
                io.to(recipient.get("socketId")).emit('friend_quit', {reason: reason});
                console.log(recipient.get("socketId") + "   ----->   " + reason);
                callback();
            });
        });
    }
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