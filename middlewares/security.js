var parameters      = require('../config/parameters.json');
const crypto        = require('crypto');
const decipher      = crypto.createDecipher('aes192', parameters.api_key_secret);
const cipher        = crypto.createCipher('aes192', parameters.api_key_secret);


module.exports = function(req, res, next) {
    
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
    console.log(key);
    if(key){

        var decrypted = '';
        decipher.on('readable', () => {
          var data = decipher.read();
          if (data)
          decrypted += data.toString('utf8');
        });
        decipher.on('end', () => {
            if(decrypted == parameters.api_key){
                next();
            }else{
                res.status(403);
                res.json({
                  "status": 403,
                  "message": "Not Authorized"
                });
                return;
            }
        });
            
        decipher.write(key, 'hex');
    } else {
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid API Key"
        });
        return;
    }
      
};