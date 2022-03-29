const { Schema, model, ObjectId } = require('mongoose');

const Message = new Schema({
	user_id: { type: ObjectId, ref: 'User' },
	username: { type: String },
	room_id: { type: ObjectId, ref: 'Chat-room' },
	mess: { type: String }

})

module.exports = model('Message', Message)