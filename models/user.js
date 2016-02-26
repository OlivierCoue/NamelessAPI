// /models/user.js

var _ 				= require("lodash");
var db 				= require('../db');
var states     		= require('../config/states.json');
var schemas 		= require("./schemas.js");  
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
    db.query('INSERT INTO user SET username="'+this.data.username+'" , state='+this.data.state+' , createdDate="'+this.data.createdDate+'", socketId="'+this.data.socketId+'", geoPoint=POINT(?, ?), searchRange=?', [this.data.geoPoint.x, this.data.geoPoint.y, this.data.searchRange], function(err,rows){    	
        if(err) throw err;
        self.set("id", rows.insertId);
    	callback(self);
    });    
}
User.prototype.save = function (callback) {  
    var self = this;
    this.data = this.sanitize(this.data);
    var query = db.query('UPDATE user SET username="'+this.data.username+'" , state='+this.data.state+' , createdDate="'+this.data.createdDate+'", socketId="'+this.data.socketId+'" , geoPoint=POINT(?, ?) , searchRange=? WHERE user.id = ? ', [this.data.geoPoint.x, this.data.geoPoint.y, this.data.searchRange, this.get('id')], function(err, rows){
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

User.prototype.findFriend = function(callback){    					
    db.query(	'SELECT * FROM user\
    			WHERE\
	    			MBRContains\
	    			(\
                        LineString\
                        (\
                            Point (\
                                '+this.get("geoPoint").x+' + '+this.get("searchRange")+' / ( 111.1 / COS(RADIANS('+this.get("geoPoint").y+'))),\
                                '+this.get("geoPoint").y+' + '+this.get("searchRange")+' / 111.1\
                                ),\
                            Point (\
                                '+this.get("geoPoint").x+' - '+this.get("searchRange")+' / ( 111.1 / COS(RADIANS('+this.get("geoPoint").y+'))),\
                                '+this.get("geoPoint").y+' - '+this.get("searchRange")+' / 111.1\
                                )\
                            ),\
                        geoPoint\
                    )\
                AND user.searchRange >= SQRT(\
                                        POW(69.1 * ('+this.get("geoPoint").x+' - x(user.geoPoint)), 2) +\
                                        POW(69.1 * (y(user.geoPoint) - '+this.get("geoPoint").y+') * COS('+this.get("geoPoint").x+' / 57.3), 2))\
    			AND user.state = ?\
    			AND user.id != ?\
                AND user.socketId != ?\
    			ORDER BY RAND() LIMIT 1', [states.SEARCHING, this.get("id"), this.get("socketId")], function(err,rows){ 
    	if(err) throw err;    	
        callback(new User(rows[0]));
    });
};

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

User.countInRange = function(x, y, searchRange, callback){
	db.query(	'SELECT COUNT(*) AS friendNb FROM user\
    			WHERE\
	    			MBRContains\
	    			(\
                        LineString\
                        (\
                            Point (\
                                '+x+' + '+searchRange+' / ( 111.1 / COS(RADIANS('+y+'))),\
                                '+y+' + '+searchRange+' / 111.1\
                                ),\
                            Point (\
                                '+x+' - '+searchRange+' / ( 111.1 / COS(RADIANS('+y+'))),\
                                '+y+' - '+searchRange+' / 111.1\
                                )\
                            ),\
                        geoPoint\
                    )\
    			AND (user.state = ? OR user.state = ?)', [states.SEARCHING, states.CHATTING], function(err,rows){     			
    	if(err) throw err;
        callback(rows);
    });
};

User.closeBySocketId = function(socketId, callback){
    db.query('update user set user.state= ? where user.socketId = ?',[states.CLOSED, socketId], function(err, rows){
        if(err) throw err;                      
    })
    db.query('select * from user where user.socketId = ?',[socketId], function(err, rows){
        if(err) throw err;
        callback(new User(rows[0]));
    });
}

User.findBySocketId =  function(socketId, callback){    
    db.query('select * from user where user.socketId = ?',[socketId], function(err, rows){
        if(err) throw err;
        callback(new User(rows[0]));
    });
}

module.exports = User;
