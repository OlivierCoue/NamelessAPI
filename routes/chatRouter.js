// /routes/chatRouter.js

var express         = require('express');
var User            = require('../models/user');
var MessageThread   = require('../models/messageThread');
var states          = require('../config/states.json');
var ent             = require('ent');

var router = express.Router();

/**
* ROUTE FOR /api/chat/start
*/
router.route('/start')
    /* POST
    * create user -> find someone to speak with -> found : create messageThread | notFound : return user 
    * @param    String    username
    */
    .post(function(req, res) {
        if(typeof(req.body.username) == 'undefined'){
            res.json({message: "bad params"});
            res.end();
            return;
        }else{
            var currentUser = new User({
                username: ent.encode(req.body.username),
                state: states.SEARCHING,
                createdDate: new Date()
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
                User.findFriend(currentUser.get("id"), function(friend){
                    /* if found */
                    if(friend.get("id") != null && friend.get("id") != ""){
                        createConversation(currentUser, friend, function(currentUser, friend, messageThread){
                            res.json({found: true, currentUser: currentUser, friend: friend, messageThread: messageThread});
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
    /* PUT
    * set the currentUser's state to closed and delete de session userId   
    */
    .put(function(req, res) {
        var sess=req.session;
        if(typeof(sess.userId) == 'undefined'){
            res.json({message: "no session"});
            res.end();
            return;
        }else{
            var currentUser = User.findById(sess.userId, function(currentUser){
                currentUser.set("state", states.CLOSED);
                currentUser.save(function(){
                });
                sess.userId = undefined;
                res.json({message: "session closed"});
            });
        }
    });

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