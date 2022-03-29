const Router = require("express")
const chatRoom = require("../models/chat-room")
const User = require('../models/user.js')
const authMiddleware = require('../middleware/auth.middleware.js')
const authPostMiddleware = require('../middleware/authPost.middleware')
const events = require('events')

const emitter = new events.EventEmitter()


const router = new Router()

router.post('/create-room', authPostMiddleware,
	async (req, res) => {
		try {
			const { roomname } = req.body
			const user = await User.findOne({ _id: req.user.id })
			const createRoom = new chatRoom({ users: [user], usernames: [user.username], roomname, roomname_lower: roomname.toLowerCase(), messages: [] })
			await createRoom.save()
			user.rooms.push(createRoom)
			await User.findOneAndUpdate({ _id: user._id }, { rooms: user.rooms })
			let resRoom = { id: createRoom._id, users: [user._id], usernames: [user.username], roomname: createRoom.roomname, }
			return res.json({ room: resRoom })
		} catch (e) {
			res.json({ message: 'Server error' })
		}
	})

router.get('/load-rooms', authMiddleware,
	async (req, res) => {
		try {
			const user = await User.findOne({ _id: req.user.id })
			let roomsBody = await chatRoom.find({ _id: { $in: user.rooms } })
			let resRooms = []
			roomsBody.forEach((room, id) => {
				resRooms = [...resRooms, { id: room._id, users: room.users, usernames: room.usernames, roomname: room.roomname, }]
			})

			await res.json({ rooms: resRooms })
			return
		} catch (e) {
			res.send({ message: 'Server error' })
		}
	}
)
router.post('/delete-room',
	async (req, res) => {
		try {
			const { userid, roomid } = req.body
			await User.updateMany({ rooms: roomid }, { $pull: { rooms: roomid } })
			await chatRoom.deleteOne({ _id: roomid })
			const user = await User.findOne({ _id: userid })
			const roomsBody = await chatRoom.find({ _id: { $in: user.rooms } })
			let resRooms = []
			roomsBody.forEach((room, id) => {
				resRooms = [...resRooms, { id: room._id, users: room.users, usernames: room.usernames, roomname: room.roomname, }]
			})
			await res.json({ rooms: resRooms })
			return
		} catch (e) {
			res.send({ message: 'Server error' })
		}
	}
)
router.post('/leave-room',
	async (req, res) => {
		try {
			const { userid, roomid } = req.body
			const user = await User.findOneAndUpdate({ _id: userid }, { $pull: { rooms: roomid } })
			await chatRoom.updateOne({ _id: roomid }, { $pull: { users: userid } })
			await chatRoom.updateOne({ _id: roomid }, { $pull: { usernames: user.username } })
			return res.status(200)
		} catch (e) {
			res.send({ message: 'Server error' })
		}
	}
)
router.post('/connect-to-room',
	async (req, res) => {
		try {
			const { roomid, userid } = req.body
			const user = await User.findOne({ _id: userid })
			const room = await chatRoom.findOne({ _id: roomid })
			let resRoom
			if (room.usernames) {
				let close = false
				room.users.forEach((user) => {
					if (user.toString() === userid) {
						close = true
					}
				})
				if (close) {
					resRoom = { id: room._id, users: room.users, usernames: room.usernames, roomname: room.roomname }
					emitter.emit('resRoom', resRoom)
					return res.status(200).json(resRoom)
				}
			}
			user.rooms.push(room)
			await User.findOneAndUpdate({ _id: userid }, { rooms: user.rooms })
			room.users.push(userid)
			room.usernames.push(user.username)
			let updatedRoom = await chatRoom.findOneAndUpdate({ _id: roomid }, { users: room.users, usernames: room.usernames })
			updatedRoom = await chatRoom.findOne({ _id: roomid })
			resRoom = { id: updatedRoom._id, users: updatedRoom.users, usernames: updatedRoom.usernames, roomname: updatedRoom.roomname, }
			emitter.emit('resRoom', resRoom)
			return res.status(200).json(resRoom)
		} catch (e) {
			res.send({ message: 'Server error' })
		}
	}
)
router.get('/get-connect-to-room',
	async (req, res) => {
		try {
			emitter.once('resRoom', (resRoom) => {
				res.json(resRoom)
			})
		} catch (e) {
			res.send({ message: 'Server error' })
		}
	}
)
router.post('/search-rooms',
	async (req, res) => {
		try {
			const { name } = req.body
			const rooms = await chatRoom.find({ roomname_lower: name.toLowerCase() })
			let resRooms = []
			rooms.forEach((room, id) => {
				resRooms = [...resRooms, { id: room._id, users: room.users, usernames: room.usernames, roomname: room.roomname, }]
			})
			return res.status(200).json({ rooms: resRooms })
		} catch (e) {
			res.send({ message: 'Server error' })
		}
	}
)
router.post('/get-user',
	async (req, res) => {
		try {
			const { userid } = req.body;
			const user = await User.findOne({ _id: userid, })
			const username = user.username
			return res.json(username)
		} catch (e) {
			console.log(e)
			res.send({ message: 'Server error' })
		}
	}
)
router.post('/get-users',
	async (req, res) => {
		try {
			const { usersid } = req.body
			let usernames = []
			usersid.forEach(async (userid, i) => {
				const username = await User.findOne({ _id: userid })
				usernames[i] = username.username
			});
			return res.json({ usernames })
		} catch (e) {
			console.log(e)
			res.send({ message: 'Server error' })
		}
	}
)
module.exports = router;
