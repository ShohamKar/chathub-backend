import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connect.js";
import errorHandler from "./middlewares/errorHandlerMiddleware.js";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import userRouter from './routes/userRoute.js'
import chatRouter from './routes/chatRoute.js'
import messageRoute from './routes/messageRoute.js'
import {Server} from 'socket.io'
import cors from 'cors'

dotenv.config({
  path: "./config/config.env",
});

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/api/v1', userRouter)
app.use('/api/v1', chatRouter)
app.use('/api/v1', messageRoute)

let start = async () => {
  let server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Conected to database");
  } catch (error) {
    console.log(`Error occured: ${error}`);
    console.log("Exiting the server...");
    server.close(() => {
      process.exit(-1);
    });
  }
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  let io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.FRONTEND_URL
    }
  })
  io.on('connection', (socket) => {
    // console.log('connected', count)
    socket.on('setup', (userDetails) => {
      socket.join(userDetails._id)
      // console.log(userDetails._id)
      socket.emit('connected')
    })

    socket.on('join chat', (roomId) => {
      socket.join(roomId)
      // console.log(`User has joined room ${roomId}!`)
    })

    socket.on('new message', (msg) => {
      msg = msg.message
      msg.chat.users.forEach(ele => {
        if(ele._id === msg.sender._id) return
        socket.in(ele._id).emit('message receive', msg)
      })
    })

    socket.off('setup', (userDetails) => {
      // console.log('User Disconnected!')
      socket.leave(userDetails._id)
    })
  })
};

app.use(errorHandler);
start();
