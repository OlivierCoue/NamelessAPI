// /models/user.js

var schemas 		= require("./schemas.js");  
var _ 				= require("lodash");
var db 				= require('../db');
var states     		= require('../config/states.json');
var MessageThread   = require('./messageThread');

var User = function (data) {  
    this.data = this.sanitize(data);
}

User.prototype.data = {}

User.prototype.sanitize = function (data) {  
    data = data || {};
    schema = schemas.user;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

User.prototype.get = function (name) {  
    return this.data[name];
}

User.prototype.set = function (name, value) {  
    this.data[name] = value;
}

User.prototype.create = function (callback) {
    var self = this;
    this.data = this.sanitize(this.data);    
    db.query("INSERT INTO user SET ? ", this.data, function(err,rows){
        if(err) throw err;
        self.set("id", rows.insertId);
    	callback(self);
    });
}

User.prototype.save = function (callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    db.query('UPDATE user SET ? WHERE user.id = ? ', [this.data, this.get('id')], function(err, rows){
		if(err) throw err;
		callback(self);
	});
}

User.prototype.setMessageThread = function (messageThreadId, callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    db.query(	'UPDATE user \
    			SET current_message_thread_id  = (SELECT message_thread.id FROM message_thread WHERE message_thread.id = ? ) \
    			WHERE user.id = ?', [messageThreadId, this.get("id")], function(err, rows){
		if(err) throw err;
		callback();
	});
}

User.prototype.getMessageThread = function (callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    db.query(	'SELECT message_thread.* \
    			FROM message_thread, user \
    			WHERE message_thread.id = user.current_message_thread_id AND user.id = ? ', [this.get("id")], function(err, rows){
		if(err) throw err;
		callback(new MessageThread(rows[0]));
	});
}

User.findAll = function(callback){
	db.query('SELECT * FROM user',function(err,rows){
        if(err) throw err;
        var users = [];
        for(var i=0; i<rows.length; i++){
        	users.push(new User(rows[i]));
        }
        callback(users);
    });
};

User.findById = function(userId, callback){ 
    db.query('SELECT * FROM user WHERE user.id = ? ', [userId], function(err,rows){ 
    	if(err) throw err;    	
        callback(new User(rows[0]));
    });   
};

User.findFriend = function(userId, callback){ 
    db.query('SELECT * FROM user WHERE user.state = ? AND user.id != ?', [states.SEARCHING, userId], function(err,rows){ 
    	if(err) throw err;    	
        callback(new User(rows[Math.round(Math.random() * (rows.length - 1))]));
    });
};

module.exports = User;
