// /models/schemas.js

schemas = {  
	user: {
    	id: null,
        username: null,        
        state: null,
        searchRange: null,
        createdDate: null,
        geoPoint:  { x: null, y: null},
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