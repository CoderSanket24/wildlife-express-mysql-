import { Router } from "express";
import { getHomePage } from "../controller/wildlife.controller.js";

const router = Router();

router.get('/',getHomePage);

export default router;