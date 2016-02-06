// /routes/messageRouter.js

var express    		= require('express');
var User            = require('../models/user');
var Message         = require('../models/message');
var ent             = require('ent');

var router = express.Router();

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
                            res.json({status: "OK", message: message, currentUser: currentUser, recipient: new User(recipient)});
                        });
                    });
                });
            });                    
        }           
    });

// Export module
module.exports = router;