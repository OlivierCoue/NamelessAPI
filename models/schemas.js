// /models/schemas.js

schemas = {  
	user: {
    	id: null,
        username: null,
        current_message_thread_id: null,
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
   		author_id: null,
   		message_thread_id: null,
   		messageText: null,
   		createdDate: null
   	}
}

module.exports = schemas;