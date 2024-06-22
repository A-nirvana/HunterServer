import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'
import { createServer } from "http";
import * as Router from './routes/index'

const app = express()
const httpServer = createServer(app)

const wss = new WebSocketServer({ server: httpServer });
let users = 0;
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
  console.log('Client connected', ++users);
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

export { httpServer, wss };