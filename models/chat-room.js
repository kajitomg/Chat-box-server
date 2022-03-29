const { Schema, model, ObjectId } = require('mongoose');

const ChatRoom = new Schema({
	users: [{ type: ObjectId, ref: 'User' }],
	usernames: [{ type: String }],
	roomname: { type: String, required: true },
	roomname_lower: { type: String, required: true },
	messages: [{ type: Object, ref: 'Message' }]

})

module.exports = model('Chat-room', ChatRoom)