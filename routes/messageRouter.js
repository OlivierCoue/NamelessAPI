// /routes/messageRouter.js

var express    		= require('express');
var ent             = require('ent');
var multer          = require('multer');
var MessageTypes    = require('../config/message_types.json');
var User            = require('../models/user');
var Message         = require('../models/message');
var MessageImage    = require('../models/messageImage');
var myEventEmitter  = require('../events/myEventEmitter');

var router = express.Router();

var upload = multer({
  dest: 'public/uploads/',
  rename: function (fieldname, filename) {
    return filename + "jpg";
  },
  limits: {fileSize: 10000000, files:2}  
}).upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'full', maxCount: 1 }])

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
                        type: MessageTypes.TEXT,
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

router.route('/image')
    .post(function(req, res) {                               
        var sess=req.session; 
        if(typeof(sess.userId) == 'undefined'){
            res.json({message: "bad params or no session"});
            res.end();            
            return;
        }else{
            var currentUser = User.findById(sess.userId, function(currentUser){                        
                currentUser.getMessageThread(function(messageThread){                    
                    var message = new Message({
                        type: MessageTypes.IMAGE,
                        messageText: "image",
                        createdDate: new Date()
                    });                    
                    messageThread.addMessage(message, currentUser, function(message){
                        upload(req, res, function (err) {
                            if (err){
                                console.log("error");
                            }else{                                
                                var messageImage = new MessageImage({
                                    id: message.get("id"),
                                    thumbnail_upload_dir: req.files['thumbnail'][0].destination,
                                    thumbnail_name: req.files['thumbnail'][0].filename,
                                    full_upload_dir: req.files['full'][0].destination,
                                    full_name: req.files['full'][0].filename,
                                    mime: req.files['thumbnail'][0].mimetype
                                });                                
                                messageImage.create(function(messageImage){

                                });

                                messageThread.getRecipient(currentUser, function(recipient){
                                    var recipient = new User(recipient);
                                    res.json({status: "OK", message: message, currentUser: currentUser, recipient: recipient});
                                    message.data.fromUs = false;                           
                                    io.to(recipient.get("socketId")).emit('message_received', {message: message});
                                });
                            }                                                    
                        });
                    });
                });
            });                    
        } 
    });

// Export module
module.exports = router;