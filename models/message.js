// /models/message.js

var schemas 		= require("./schemas.js");  
var _ 				= require("lodash");
var db 				= require('../db');
var states     		= require('../config/states.json');
var User            = require('../models/user');
var MessageThread   = require('../models/messageThread');

var Message = function (data) {  
    this.data = this.sanitize(data);
}

Message.prototype.data = {}

Message.prototype.sanitize = function (data) {  
    data = data || {};
    schema = schemas.message;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

Message.prototype.get = function (name) {  
    return this.data[name];
}

Message.prototype.set = function (name, value) {
    this.data[name] = value;
}

Message.prototype.create = function (author, messageThread, callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    db.query(   "INSERT INTO message SET message.messageText = ?, \
                message.createdDate = ? , \
                message.author_id = (SELECT user.id FROM user WHERE user.id = ?), \
                message.message_thread_id = (SELECT message_thread.id FROM message_thread WHERE message_thread.id = ?)"
                , [this.data.messageText, this.data.createdDate, author.get("id"), messageThread.get("id")], function(err,rows){    
        if(err) throw err;
        self.set("id", rows.insertId);        
    	callback(self);
    });
}

Message.prototype.save = function (callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    db.query('UPDATE message SET ? WHERE message.id = ? ', [this.data, this.get('id')], function(err, rows){
		if(err) throw err;
		callback(self);
	});
}

Message.prototype.setAuthor = function(user, callback){
    var self = this;
    db.query('INSERT UPDATE message SET ? WHERE message.id = ? ', [{author_id: user.get("id")}, this.get("id")], function(err, rows){
        if(err) throw err;
        callback(self);
    });
}

Message.prototype.setMessageThread = function(messageThreads, callback){
    var self = this;
    db.query('INSERT UPDATE message SET ? WHERE message.id = ? ', [{message_thread_id: messageThread.get("id")}, this.get("id")], function(err, rows){
        if(err) throw err;
        callback(self);
    });
}

Message.prototype.getAuthor = function(callback){    
    db.query('SELECT user.* FROM user, message WHERE message.author_id = user.id AND user.id = ? ', [user.get("id")], function(err, rows){
        if(err) throw err;
        callback(new User(rows[0]));
    });
}

Message.findAll = function(callback){
	db.query('SELECT * FROM message',function(err,rows){
        if(err) throw err;
        var messages = [];
        for(var i=0; i<rows.length; i++){
        	messages.push(new Message(rows[i]));
        }
        callback(messages);
    });
};

Message.findById = function(messageThreadId, callback){ 
    db.query('SELECT * FROM message WHERE message.id = ? ', [messageThreadId], function(err,rows){ 
    	if(err) throw err;    	
        callback(new Message(rows[0]));
    });   
};

module.exports = Message;
