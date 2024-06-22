import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from "http";
import * as Router from './routes/index'
import { Server } from 'socket.io';
const app = express()
const httpServer = createServer(app)

const wss = new WebSocketServer({ server: httpServer });
const ALLOWED_ORIGINS = ["http://localhost:3000"];

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
  ws.send('Hello! Message From Server!!');
});

app.use(express.json())
app.use((req, res, next) => {
  const { origin } = req.headers;
  const theOrigin =
    ALLOWED_ORIGINS.indexOf(<string>origin) >= 0 ? origin : ALLOWED_ORIGINS[0];
  res.header("Access-Control-Allow-Origin", theOrigin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE,OPTIONS,HEAD");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' })
})

app.use('/auth', Router.userRoutes.router)


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

const rooms = {};
const users = {};

io.on('connection', (socket) => {
  console.log('a user connected ' + socket.id);

  socket.on("disconnect", (params) => {
    Object.keys(rooms).map(roomId => {
      rooms[roomId].users = rooms[roomId].users.filter(x => x !== socket.id)
    })
    delete users[socket.id];
  })

  socket.on("join", (params) => {
    const roomId = params.roomId;
    users[socket.id] = {
      roomId: roomId
    }
    if (!rooms[roomId]) {
      rooms[roomId] = {
        roomId,
        users: []
      }
    }
    rooms[roomId].users.push(socket.id);
    console.log("user added to room " + roomId);
  });

  socket.on("localDescription", (params) => {
    let roomId = users[socket.id].roomId;
    
    let otherUsers = rooms[roomId].users;
    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("localDescription", {
            description: params.description
        })
      }
    })
  })

  socket.on("remoteDescription", (params) => {
    let roomId = users[socket.id].roomId;    
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("remoteDescription", {
            description: params.description
        })
      }
    })
  });

  socket.on("iceCandidate", (params) => {
    let roomId = users[socket.id].roomId;    
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("iceCandidate", {
          candidate: params.candidate
        })
      }
    })
  });


  socket.on("iceCandidateReply", (params) => {
    let roomId = users[socket.id].roomId;    
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("iceCandidateReply", {
          candidate: params.candidate
        })
      }
    })
  });

});

export { httpServer, wss };