const Router = require('express')
const User = require('../models/user.js')
const chatRoom = require('../models/chat-room')
const message = require('../models/message')
const config = require('config')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { findOne } = require('../models/user.js')
const authMiddleware = require('../middleware/auth.middleware.js')

const router = new Router()

router.post('/registration',
	[
		check('username', 'Uncorrect username').isLength({ min: 1 }),

		check('password', 'Password must be longer than 3 and shorter then 12').isLength({ min: 3, max: 16 })
	],
	async (req, res) => {
		try {

			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({ message: 'Uncorrect request', errors })
			}
			const { username, password } = req.body;

			const candidate = await User.findOne({ username });

			if (candidate) {
				return res.status(400).json({ next: 'next', message: `User with username ${username} was created` })
			}
			const hashpassword = await bcrypt.hash(password, 8)
			const user = new User({ username, password: hashpassword, rooms: [] })
			await user.save()
			const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });
			return res.json({
				token,
				user: {
					id: user.id,
					username: user.username,
					rooms: user.rooms
				}
			})

		} catch (e) {
			console.log(e)
			res.send({ message: 'Server error' })
		}
	})


router.post('/login',
	async (req, res) => {
		try {
			const { username, password } = req.body

			const user = await User.findOne({ username })

			if (!user) {
				return res.status(404).json({ message: 'User not found' })
			}
			const isPassValid = bcrypt.compareSync(password, user.password)

			if (!isPassValid) {
				return res.status(400).json({ message: 'Invalid password' })
			}
			const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });

			return res.json({
				token,
				user: {
					id: user.id,
					username: user.username,
					rooms: user.rooms
				}
			})

		} catch (e) {
			console.log(e)
			res.send({ message: 'Server error' })
		}
	})

router.get('/auth', authMiddleware,
	async (req, res) => {
		try {
			const user = await User.findOne({ _id: req.user.id })
			const token = jwt.sign({ id: user.id }, config.get('secretKey'), { expiresIn: '1h' });
			return res.json({
				token,
				user: {
					id: user.id,
					username: user.username,
					rooms: user.rooms
				}
			})
		} catch (e) {
			console.log(e)
			res.send({ message: 'Server error' })
		}
	})


router.post('/message',
	async (req, res) => {
		try {


		} catch (e) {
			console.log(e)
			res.send({ message: 'Server error' })
		}
	})

module.exports = router;