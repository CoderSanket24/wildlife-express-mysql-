import { Router } from "express";
import { getLoginPage, getLogout, getRegistrationPage, postLoginPage, postRegistrationPage } from "../controller/auth.controller.js";

const router = Router();

router.route('/register').get(getRegistrationPage).post(postRegistrationPage);
router.route('/login').get(getLoginPage).post(postLoginPage);
router.route('/logout').get(getLogout);

export const authrouter= router;