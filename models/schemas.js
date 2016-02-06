// /models/schemas.js

schemas = {  
	user: {
    	id: null,
        username: null,        
        state: null,
        createdDate: null,
        socketId: null
   	},
   	messageThread: {
   		id: null,
   		updatedDate: null,
   		createdDate: null
   	},
   	message: {
   		id: null,
   		messageText: null,
   		createdDate: null
   	}
}

module.exports = schemas;