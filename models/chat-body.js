const { Schema, model, ObjectId } = require('mongoose');

const ChatBody = new Schema({
	messages: [{ type: ObjectId, ref: 'Message' }],
	room_id: { type: ObjectId, ref: 'Chat-room' }

})

/*module.exports = model('Chat-body', ChatBody)*/