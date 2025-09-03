import { Router } from "express";
import { getLoginPage, getRegistrationPage } from "../controller/auth.controller.js";

const router = Router();

router.route('/register').get(getRegistrationPage);
router.route('/login').get(getLoginPage);

export const authrouter= router;