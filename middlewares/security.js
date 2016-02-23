var parameters      = require('../config/parameters.json');
var ursa            = require('ursa');
const crypto        = require('crypto');
const assert        = require('assert');
const constants     = require('constants');
var NodeRSA = require('node-rsa');

module.exports = function(req, res, next) {
    
    var sess=req.session;
    var keyIn = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

    if(typeof(sess.private_key) == 'undefined'){
            res.status(403);
            res.json({
              "status": 403,
              "message": "Not authentified"
            });
            return;
    }else{
        
        if(typeof(sess.api_key) == 'undefined'){
            if(keyIn){            
                var key = new NodeRSA({b: 1024});
                key.importKey(sess.private_key, 'pkcs8-private');
                var decryptedKey = key.decrypt(new Buffer(keyIn, 'base64'), 'base64');

                if(Buffer.compare(new Buffer(decryptedKey, 'base64'), new Buffer(parameters.api_key, 'base64')) == 0){
                    sess.api_key = parameters.api_key;
                    next();
                }else{
                    res.status(403);
                    res.json({
                        "status": 403,
                        "message": "Nice try"
                    });
                    return;
                }
            }else{
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "No api key given"
                });
                return;
            }
        }else{
            if(sess.api_key == parameters.api_key){
                next();
                console.log("Already authentified");
            }else{
                res.status(403);
                res.json({
                  "status": 403,
                  "message": "Nope"
                });
                return;
            }
        }
    }
      
};