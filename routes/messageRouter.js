// /routes/messageRouter.js

var express    		= require('express');
var User            = require('../models/user');
var Message         = require('../models/message');
var ent             = require('ent');
var myEventEmitter  = require('../events/myEventEmitter');

var router = express.Router();

var io = null;

myEventEmitter.on('io', function(ioInstance){
    io = ioInstance;
});

/**
* ROUTE FOR /api/message
*/
router.route('/')
    /* POST
    * @param    String    messageText
    */
    .post(function(req, res) {
        var sess=req.session; 
        if(typeof(sess.userId) == 'undefined' || typeof(req.body.messageText) == 'undefined'){
            res.json({message: "bad params or no session"});
            res.end();            
            return;
        }else{
            var currentUser = User.findById(sess.userId, function(currentUser){                        
                currentUser.getMessageThread(function(messageThread){                    
                    var message = new Message({
                        messageText: ent.encode(req.body.messageText),
                        createdDate: new Date()
                    });
                    messageThread.addMessage(message, currentUser, function(message){
                        messageThread.getRecipient(currentUser, function(recipient){
                            var recipient = new User(recipient);
                            res.json({status: "OK", message: message, currentUser: currentUser, recipient: recipient});
                            message.data.fromUs = false;                           
                            io.to(recipient.get("socketId")).emit('message_received', {message: message});
                        });
                    });
                });
            });                    
        }           
    });

// Export module
module.exports = router;