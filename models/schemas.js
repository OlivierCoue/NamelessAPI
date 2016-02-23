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
      type: null,
   		messageText: null,
   		createdDate: null
   	},
    messageImage: {
      id: null,
      thumbnail_upload_dir: null,
      thumbnail_name: null,
      full_upload_dir: null,
      full_name: null,
      mime: null
    }
}

module.exports = schemas;