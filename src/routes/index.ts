import { Router } from "express";
import RoomsRouter from "./room-router";

const router: Router = Router();

router.use("/rooms", RoomsRouter);

export default router;
