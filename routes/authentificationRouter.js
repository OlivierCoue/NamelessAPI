// /routes/authentificationRouter.js

var express    		= require('express');
var ent        		= require('ent');
var User 			= require('../models/user');
var parameters      = require('../config/parameters.json');
var states     		= require('../config/states.json');
const crypto        = require('crypto');
const assert        = require('assert');
const constants        = require('constants');
var ursa = require('ursa');
var router = express.Router();

/**
*ROUTE FOR /auth
*/
router.route('/')   
    /* GET
    */
    .get(function(req, res) {
        var sess=req.session;

        const cert2 = crypto.Certificate();

        // Generate Alice's keys...
        const alice = crypto.createDiffieHellman(8);
        const alice_key = alice.generateKeys();

        // Generate Bob's keys...
        const bob = crypto.createDiffieHellman(8);
        const bob_key = bob.generateKeys();

        // Exchange and generate the secret...
        const alice_secret = alice.computeSecret(bob_key);
        const bob_secret = bob.computeSecret(alice_key);

        const key = crypto.pbkdf2Sync(bob_secret, 'salt', 100000, 512, 'sha512');
        console.log(bob_secret);
        crypto.publicEncrypt(key.toString('base64'), new Buffer('hello', 'base64'));

        sess.private_key = alice_secret;
        res.json({public_key: bob_secret});
               
    });

// Export module
module.exports = router;