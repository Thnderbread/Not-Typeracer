import http from "http";
import sock from "sockjs";
import express from "express";
import MainRouter from "./routes";
import wssHandler from "./wssHandler";
import cookieParser from "cookie-parser";
import getReqInfo from "./middleware/getReqInfo";

// ? How to handle user leaving room mid-race (erasing the roomId cookie)
// ? WS somehow needs to contact rest api to check. Maybe rest api could look at redis and see if user is still in that room?
const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", getReqInfo, MainRouter);
app.use("/api", getReqInfo, MainRouter);

const wss = sock.createServer();
const server = http.createServer(app);
wss.installHandlers(server, { prefix: "/ws" });

wss.on("connection", wssHandler);

server.listen(8000, "0.0.0.0", console.log);
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
