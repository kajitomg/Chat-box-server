const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const authRouter = require('./routes/auth.routes');
const roomRouter = require('./routes/room.routes');
const messageRouter = require('./routes/message.router')
const corsMiddleWare = require('./middleware/cors.middleware')
const { json } = require('express');
const cors = require('cors')

const app = express();

const PORT = process.env.PORT || config.get('serverPort')
const DBurl = config.get('dbUrl')
app.use(cors())
app.use(corsMiddleWare)
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/room', roomRouter)
app.use('/api/message', messageRouter)

const start = async () => {
	try {

		await mongoose.connect(DBurl)

		app.listen(PORT, () => console.log(`Server has been started on ${PORT} port`))
	} catch (e) {

	}
};

start()