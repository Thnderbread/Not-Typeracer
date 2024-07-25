import express from "express";
import MainRouter from "./routes";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import getReqInfo from "./middleware/getReqInfo";
import initSocketIoServer from "./config/socketIoServer";

/**
 * Work on updating display for host on ws connection
 * Starting game
 * * Server responds w/ textbox w/timeout?
 * * after timeout, game starts
 * * textbox has a polling hx-on (or hx-trigger?) that will send updates to ws
 * * ws will take information and propagate it to all clients
 * * on receipt, client moves avatar div forward by progress amount
 * * maybe new race button that's disabled until all remaining players' progress is at 100?
 */
const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", MainRouter);
app.use("/api", getReqInfo, MainRouter);

const httpServer = createServer(app);
initSocketIoServer(httpServer);

httpServer.listen(8000, "127.0.0.1", console.log);
