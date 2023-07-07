import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import apiRoute from "./src/router/apiRoute.js";
import apiUserRoute from "./src/router/apiUserRoute.js";
import apiItemRouter from "./src/router/apiItemRoute.js";
import "./db.js";
import path from "path";
import apiMassageRoute from "./src/router/apiMassageRoute.js";
import { saveMessages } from "./src/controller/apiMessageController.js";

const dirName = process.cwd();
const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));

app.use(express.static(path.join(dirName + "/public")));

httpServer.listen(process.env.PORT, () =>
  console.log(`server on prot ${process.env.PORT}`)
);

//Socket.io 시작
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    mathods: ["GET", "POST"],
  },
});

//메세지 기능
io.on("connection", async (socket) => {
  let chatLog = [];
  const roomId = socket.handshake.query.roomId;
  const isEmpty = io.sockets.adapter.rooms?.get(roomId);
  const userId = socket.handshake.query.userId;
  socket["userName"] = socket.handshake.query.userName;
  await socket.join(roomId);

  socket.on("send_message", (msg) => {
    const message = `${msg.message}`;
    chatLog.push([userId, message]);
    socket.to(roomId).emit("receive_message", message);
  });
  socket.on("disconnect", async (done) => {
    if (!isEmpty || isEmpty.size === 0) {
      await saveMessages(roomId, chatLog);
      chatLog = [];
    }
  });
});

//프론트 코드 브라우저로 보내기
app.use(express.static(path.join(process.cwd(), "./src/client")));

app.use("/api", apiRoute);
app.use("/user/api", apiUserRoute);
app.use("/item/api", apiItemRouter);
app.use("/message/api", apiMassageRoute);

//api요청 제외 리액트 라우트로 넘기기
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "./src/client/index.html"));
});
