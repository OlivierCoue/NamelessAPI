// /routes/userRouter.js

var express    		= require('express');
var ent        		= require('ent');
var User 			= require('../models/user');
var states     		= require('../config/states.json');

var router = express.Router();

/**
* ROUTE FOR /api/users/friend
*/
router.route('/friend')
	/* GET
    *  get one user to chat with
    */
    .get(function(req, res) {
    	var sess=req.session;
        if(typeof(sess.userId) == 'undefined'){
            res.json({message: "no session"}); 
            res.end();
            return;
        }else{                
            User.findFriend(sess.userId, function(user){               
                res.json(user);
            });
       	}       
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
            		console.log("user updated");
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
    })
    /* GET
    *  get all users
    */
    .get(function(req, res) {
        User.findAll(function(users){            
            res.json(users);
        });
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