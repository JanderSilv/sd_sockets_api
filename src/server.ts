import { Socket } from 'socket.io';

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const { Router } = require('express');
const routes = Router();

const app = express();
const server = http.Server(app);

let io = socketio(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket: Socket) => {
  console.log('[SOCKET] Listen => An user has connected');
  socket.on('initials', (data: string) => {
    console.log(`[SOCKET] Name => ${data} (${typeof data}) `);
    if (typeof data !== 'string') throw Error('Espera-se receber uma string');
    const nameArr = data.split('');
    let initials = nameArr.filter(function (char) {
      return /[A-Z]/.test(char);
    });
    io.emit('initials', { initials: initials.join(''), protocol: 'Socket' });
  });

  socket.on('disconnect', (reason: any) => {
    console.log(
      `[SOCKET] Disconnect => An user has disconnected | reason: ${reason}`
    );
  });
});

routes.get('/', () => console.log('Hello word !!!'));

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(express.json());
app.use(routes);

server.listen(3333, () =>
  console.log(`server started: PORT: ${3333} | ENV: dev`)
);
