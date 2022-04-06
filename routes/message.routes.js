const Router = require('express')
const events = require('events');
const chatRoom = require('../models/chat-room');
const User = require('../models/user')
const Message = require('../models/message')
const emitter = new events.EventEmitter()
const router = new Router();

router.post('/send-message',
	async (req, res) => {
		try {
			const { message, userid, roomid } = req.body;
			const user = await User.findOne({ _id: userid })
			const date = new Date()
			let month = date.getMonth().toString()
			let day = date.getDate().toString()
			let hours = date.getHours().toString()
			let minutes = date.getMinutes().toString()
			let seconds = date.getSeconds().toString()
			if ((date.getMonth() + 1) < 10) {
				month = `0${date.getMonth() + 1}`
			}
			if (date.getDate() < 10) {
				day = `0${date.getDate()}`
			}
			if (date.getHours() < 10) {
				hours = `0${date.getHours()}`
			}
			if (date.getMinutes() < 10) {
				minutes = `0${date.getMinutes()}`
			}
			if (date.getSeconds() < 10) {
				seconds = `0${date.getSeconds()}`
			}
			const dateObj = {
				year: date.getFullYear().toString(),
				month: month,
				day: day,
				hours: hours,
				minutes: minutes,
				seconds: seconds
			}
			console.log(dateObj)
			const time = (dateObj.hours + ':' + dateObj.minutes).toString()
			const newMessage = new Message({ user_id: user, date: dateObj, time: time, username: user.username, mess: message, room_id: roomid })
			await newMessage.save()
			let updatedRoom = await chatRoom.findOne({ _id: roomid })
			updatedRoom = await chatRoom.findOneAndUpdate({ _id: roomid }, { messages: [...updatedRoom.messages, newMessage] })
			updatedRoom = await chatRoom.findOne({ _id: roomid })
			let resRoom = { id: updatedRoom._id, users: updatedRoom.users, usernames: updatedRoom.usernames, roomname: updatedRoom.roomname, }
			let mess
			updatedRoom.messages.forEach(message => {
				if (message._id.toString() === newMessage._id.toString()) {
					mess = message
				}
			});
			emitter.emit('newMessage', { message: mess, room: resRoom })
			return res.status(200).json({ message: mess, room: resRoom })
		} catch (e) {
			return res.status(400).json({ message: 'Server error' })
		}
	}

)
router.get('/get-message',
	async (req, res) => {
		try {
			emitter.once('newMessage', ({ message, room }) => {
				return res.status(200).json({ message: message, room: room })
			})
		} catch (e) {
			return res.status(400).json({ message: 'Server error' })
		}
	}

)
router.post('/load-messages',
	async (req, res) => {
		try {
			const quantity = 100
			const { roomid, lastmessid } = req.body
			let room = await chatRoom.find({ _id: roomid }, { messages: 1 })
			let total = room[0].messages.length
			let revMessages = room[0].messages.reverse()
			let messages = []
			let go
			if (lastmessid) {
				go = false
				revMessages.forEach(mess => {
					if (mess._id.toString() === lastmessid) {
						go = true;
						return
					}
					if (go) {
						if (messages.length < quantity) {
							messages.push(mess)
						}
					}
				})
				messages.reverse()
			}
			else if (!lastmessid) {
				go = true
				revMessages.forEach(mess => {
					if (messages.length === quantity) {
						go = false;
						return
					}
					if (go) {
						messages.push(mess)
					}
				})
				messages.reverse()
				total = revMessages.length
			}
			return res.status(200).json({ messages: messages, total: total })
		} catch (e) {
			return res.status(400).json({ message: 'Server error' })
		}
	}

)
module.exports = router;