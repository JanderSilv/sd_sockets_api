import { Socket } from "socket.io";
require("dotenv").config();
const net = require("net");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const { Router } = require("express");
const routes = Router();

const app = express();
const server = http.Server(app);

let io = socketio(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  console.log("[SOCKET] Listen => An user has connected");
  socket.on("initials", (data: string) => {
    console.log(`[SOCKET] Name => ${data} (${typeof data}) `);
    if (typeof data !== "string") throw Error("Espera-se receber uma string");
    const nameArr = data.split("");
    let initials = nameArr.filter(function (char) {
      return /[A-Z]/.test(char);
    });
    io.emit("initials", {
      initials: initials.join(""),
      protocol: "WebSockets",
    });
  });

  socket.on("initials_rpc", (data: string) => {
    console.log(`[RPC_S_LIB - initials_rpc] Name => ${data} (${typeof data}) `);
    if (typeof data !== "string") throw Error("Espera-se receber uma string");
    try {
      const client = new net.Socket();
      client.connect(process.env.RPC_S_PORT, process.env.RPC_S_HOST, () => {
        console.log("[RPC_S_LIB] initials_rpc => Connected");
        client.write(data);
      });
      client.on("data", (data: any) => {
        console.log("[RPC_S_LIB] initials_rpc => Received: " + data);
        const textDecoder = new TextDecoder("utf-8");
        const arrayBuffer = new Uint8Array(data);
        io.emit("initials_rpc", {
          initials: textDecoder.decode(arrayBuffer),
          protocol: "RPC_S_LIB",
        });
        client.destroy(); // kill client after server's response
      });
      client.on("close", () => {
        console.log("[RPC_S_LIB] initials_rpc => Connection closed");
      });
    } catch (error) {
      console.log(`[RPC_S_LIB] initials_rpc => ${error}`);
    }
  });

  socket.on("disconnect", (reason: any) => {
    console.log(
      `[SOCKET] Disconnect => An user has disconnected | reason: ${reason}`
    );
  });
});

routes.get("/", () => console.log("Hello word !!!"));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(routes);

server.listen(process.env.PORT || 3333, () =>
  console.log(`server started: PORT: ${process.env.PORT || 3333} | ENV: dev`)
);
