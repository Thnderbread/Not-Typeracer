import express from "express";
import MainRouter from "./routes";
import { createServer } from "http";
import localtunnel from "localtunnel";
import cookieParser from "cookie-parser";
import getReqInfo from "./middleware/getReqInfo";
import initSocketIoServer from "./config/socketIoServer";

const PORT = (process.env.PORT as unknown as number) ?? 8000;

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/", MainRouter);
app.use("/api", getReqInfo, MainRouter);

const httpServer = createServer(app);
initSocketIoServer(httpServer);

httpServer.listen(PORT, "0.0.0.0", async () => {
  const tunnel = await localtunnel({ port: PORT });
  const whatIsMyIpUrl = "https://www.whatismyip.com";
  console.log(
    `NotTyperacer is running at '${tunnel.url}'.
    You'll need to have your public IPv4 address as the password, which you can get here: '${whatIsMyIpUrl}'.
    This will be the password required to enter the site. Only share this with people you trust if you want to race with friends.`
  );
});
