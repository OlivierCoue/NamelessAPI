// /models/message.js

var schemas 		= require("./schemas.js");  
var _ 				= require("lodash");
var db 				= require('../db');
var states     		= require('../config/states.json');

var MessageImage = function (data) {  
    this.data = this.sanitize(data);
}

MessageImage.prototype.data = {}

MessageImage.prototype.sanitize = function (data) {  
    data = data || {};
    schema = schemas.messageImage;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

MessageImage.prototype.get = function (name) {  
    return this.data[name];
}

MessageImage.prototype.set = function (name, value) {
    this.data[name] = value;
}

MessageImage.prototype.create = function (callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    db.query("INSERT INTO message_image SET ? ", this.data, function(err,rows){    
        if(err) throw err;      
    	callback(self);
    });
}

MessageImage.prototype.save = function (callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    db.query('UPDATE message_image SET ? WHERE message_image.id = ? ', [this.data, this.get('id')], function(err, rows){
		if(err) throw err;
		callback(self);
	});
}

MessageImage.findAll = function(callback){
	db.query('SELECT * FROM message_image',function(err,rows){
        if(err) throw err;
        var messageImages = [];
        for(var i=0; i<rows.length; i++){
        	messageImages.push(new MessageImage(rows[i]));
        }
        callback(messageImages);
    });
};

MessageImage.findById = function(messageImageId, callback){
    db.query('SELECT * FROM message WHERE message.id = ? ', [messageImageId], function(err,rows){ 
    	if(err) throw err;    	
        callback(new MessageImage(rows[0]));
    });   
};

module.exports = MessageImage;
