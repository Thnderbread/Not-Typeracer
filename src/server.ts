import http from "http";
import WebSocket from "ws";
import express from "express";
import MainRouter from "./routes";
// import wssHandler from "./wssHandler";
import cookieParser from "cookie-parser";
import getReqInfo from "./middleware/getReqInfo";

// ? How to handle user leaving room mid-race (erasing the roomId cookie)
// ? WS somehow needs to contact rest api to check. Maybe rest api could look at redis and see if user is still in that room?
const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", MainRouter);
app.use("/api", getReqInfo, MainRouter);

const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  console.log(`Received connection!: ${ws.url}`);
  ws.onmessage = (e) => {
    const message = e.data as Buffer;
    console.log(`Received a message: ${message.toString()}`);
    ws.send("Ho!");
  };
});
const server = http.createServer(app);
server.listen(8000, "127.0.0.1", console.log);
// the medium article guy who uses go should be my example
// need to find some way to manage games in a stateless way
// look when root is hit send a user id
// when create game is hit send a game id
// when someone joins add them to game's player list
// atp, websocket connection should exist on server & client. then you can just use ws.send to send and receive updates
// '/' ept should just serve html and also give session cookie (maybe uuid?)
// - redis will hold room & player ids temporarily

// - maybe mongo or sumn for texts

// '/create' ept should make a room

// '/join' ept should allow new users to join

// the other stuff will be w/ websocket stuff
