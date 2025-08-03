import { Router } from "express";
import { getHomePage, getVisitorPage } from "../controller/wildlife.controller.js";

const router = Router();

router.get('/',getHomePage);
router.get('/visitors.html',getVisitorPage);

export default router;