import { Router } from "express";
import RoomsRouter from "./room-router";
import IndexRouter from "./index-router";

const router: Router = Router();

router.use("/", IndexRouter);
router.use("/rooms", RoomsRouter);

export default router;
