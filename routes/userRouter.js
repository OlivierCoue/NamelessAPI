// /routes/userRouter.js

var express    		= require('express');
var ent        		= require('ent');
var User 			= require('../models/user');
var states     		= require('../config/states.json');
const crypto        = require('crypto');

var router = express.Router();


/**
* ROUTE FOR /api/users/socket
*/
router.route('/socket')
    /* POST
    */
    .post(function(req, res){
        var sess=req.session;
        if (typeof(req.body.socketId) == 'undefined') {
            res.json({message: "bad params"}); 
            res.end();
            return;
        }else{            
            sess.socket_id = req.body.socketId;
            res.end();
        };
    });

/**
* ROUTE FOR /api/users/updatesocket
*/
router.route('/updatesocket')
    /* POST
    */
    .post(function(req, res){
        var sess=req.session;
        if (typeof(req.body.lastSocketId) == 'undefined' || typeof(req.body.newSocketId) == 'undefined') {
            res.json({message: "bad params"}); 
            res.end();
            return;
        }else{            
            User.findBySocketId(lastSocketId, function(user){
                sess.user_id = user.get("id");
                user.set("socketId", req.body.newSocketId);
                user.save(function(user){
                    console.log("socketId updated");
                    res.end();
                });                
            });                                
        };
    });

/**
* ROUTE FOR /api/users/states
*/
router.route('/states')     
    /* POST
    * update user's state - if state = closed : delete userId from session
    * @param    Integer    state
    */
    .post(function(req, res) {        
        var sess=req.session;
        if (typeof(sess.userId) == 'undefined' || typeof(req.body.state) == 'undefined') {
            res.json({message: "no session or bad params"}); 
            res.end();
            return;
        }else{
            var newState = req.body.state;
            User.findById(sess.userId, function(user){
            	if(newState == states.CLOSED) sess.userId = undefined;
            	user.set("state", newState);
            	user.save(function(user){
            		console.log(user.get("socketId") + " --------> user updated");
            	});
            });            
            res.end();
        }
    });

/**
*ROUTE FOR /api/users
*/
router.route('/')   
    /* POST
    * create user
    * @param    String    username
    */
    .post(function(req, res) {
        var sess=req.session;       
        var user = new User({
            username: ent.encode(req.body.username),
            state: states.SEARCHING,
            createdDate: new Date()
        });
        user.create(function(newUser){
        	req.session.userId = newUser.get("id");
        	res.end();
        })                 
    });

/**
*ROUTE FOR /api/users/:user_id
*/
router.route('/:user_id')
    /* GET
    *  get one user by id
    */
    .get(function(req, res) {
        var userIdParam = req.params.user_id;
        if(!isNaN(userIdParam)){
            User.findById(userIdParam, function(user){               
                res.json(user);                
            });
        }else{
            res.json({message: "bad params, must be a number"}); 
        }
    });

// Export module
module.exports = router;