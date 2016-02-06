// /models/messageThread.js

var schemas 		= require('./schemas.js');  
var _ 				= require('lodash');
var db 				= require('../db');
var User            = require('./user');
var states     		= require('../config/states.json');

var MessageThread = function (data) {  
    this.data = this.sanitize(data);
}

MessageThread.prototype.data = {}

MessageThread.prototype.sanitize = function (data) {  
    data = data || {};
    schema = schemas.messageThread;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

MessageThread.prototype.get = function (name) {  
    return this.data[name];
}

MessageThread.prototype.set = function (name, value) {  
    this.data[name] = value;
}

MessageThread.prototype.create = function (callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    db.query("INSERT INTO message_thread SET ?", this.data,function(err,rows){       
        if(err) throw err;
        self.set("id", rows.insertId);
    	callback(self);
    });
}

MessageThread.prototype.save = function (callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    db.query('UPDATE message_thread SET ? WHERE message_thread.id = ? ', [this.data, this.get('id')], function(err, rows){
		if(err) throw err;
		callback(self);
	});
}

MessageThread.prototype.addUser = function(user, callback){
    var self = this;
    db.query('INSERT INTO user_message_thread SET ?',  {user_id: user.get("id"), message_thread_id: this.get("id") }, function(err, rows){
        if(err) throw err;        
        user.setMessageThread(self.get("id"), function(){});
        user.set("state", states.CHATTING);
        user.save(function(user){
            callback(user);
        });
    });
}

MessageThread.prototype.addMessage = function(message, author, callback){
    message.create(author, this, function(message){
        callback(message);
    });
}

MessageThread.prototype.getUsers = function(callback){
    db.query('SELECT user.* FROM user, user_message_thread WHERE user_message_thread.user_id = user.id AND message_thread_id = ?', [this.get("id")], function(err,rows){
        if(err) throw err;
        var users = [];
        for(var i=0; i<rows.length; i++){
            users.push(new User(rows[i]));
        }
        callback(users);
    });
};

MessageThread.prototype.getRecipient = function(sender, callback){
    db.query(   'SELECT user.* \
                FROM user, user_message_thread \
                WHERE user_message_thread.user_id = user.id AND message_thread_id = ? \
                AND user.id != ?', [this.get("id"), sender.get("id")], function(err,rows){
        if(err) throw err; 
        callback(rows[0]);
    });
};

MessageThread.findAll = function(callback){
	db.query('SELECT * FROM message_thread',function(err,rows){
        if(err) throw err;
        var messageThreads = [];
        for(var i=0; i<rows.length; i++){
        	messageThreads.push(new MessageThread(rows[i]));
        }
        callback(messageThreads);
    });
};

MessageThread.findById = function(messageThreadId, callback){ 
    db.query('SELECT * FROM message_thread WHERE message_thread.id = ? ', [messageThreadId], function(err,rows){ 
    	if(err) throw err;    	
        callback(new MessageThread(rows[0]));
    });   
};

module.exports = MessageThread;
