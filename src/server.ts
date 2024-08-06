import express from "express";
import MainRouter from "./routes";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import getReqInfo from "./middleware/getReqInfo";
import initSocketIoServer from "./config/socketIoServer";

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", MainRouter);
app.use("/api", getReqInfo, MainRouter);

const httpServer = createServer(app);
initSocketIoServer(httpServer);

httpServer.listen(8000, "127.0.0.1", console.log);
