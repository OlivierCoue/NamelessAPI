// /routes/authentificationRouter.js

var express    		= require('express');
var NodeRSA         = require('node-rsa');

var router = express.Router();

/**
*ROUTE FOR /auth
*/
router.route('/')   
    /* GET
    */
    .get(function(req, res) {

        var sess=req.session;    

        var key = new NodeRSA({b: 1024});
        
        sess.private_key = key.exportKey("pkcs8-private");       
        
        res.json({public_key: key.exportKey("pkcs8-public-pem")});        

    });

// Export module
module.exports = router;