// /routes/chatRouter.js

var express    		= require('express');
var db        		= require('../dbFunction/db');
var User            = require('../models/user');
var states          = require('../config/states');

var router = express.Router();

/**
* ROUTE FOR /api/chat/start
*/
router.route('/start')
    /* POST
    * create new messageThread -> add users to this thread -> set users currentThread -> set users state: chatting
    * @param    Integer    userId
    */
    .post(function(req, res) {
        var sess=req.session;
        var userToChatId = req.body.userId;
        console.log(sess);
        if(typeof(sess.userId) == 'undefined' && typeof(userToChatId) == 'undefined'){
            res.json({message: "bad params"});
            res.end();            
            return;
        }else{
            var messageThread = {
                createdDate: new Date(),
                updatedDate: new Date()
            };
            db.query("INSERT INTO message_thread SET ?", messageThread,function(err,rows){
                if(err) throw err;  
                messageThread.id = rows.insertId;
                db.query("INSERT INTO user_message_thread SET ?", {user_id: userToChatId, message_thread_id: messageThread.id },function(err,rows){if(err) throw err;});
                db.query("INSERT INTO user_message_thread SET ?", {user_id: sess.userId, message_thread_id: messageThread.id },function(err,rows){if(err) throw err;});
                User.findById(sess.userId, function(user){                    
                    user.set("current_message_thread_id", messageThread.id);
                    user.set("state", states.CHATTING);
                    user.save(function(user){});
                });
                User.findById(userToChatId, function(user){                    
                    user.set("current_message_thread_id", messageThread.id);
                    user.set("state", states.CHATTING);
                    user.save(function(user){});
                });                   
                res.end();
            }); 
        }           
    });

// Export module
module.exports = router;