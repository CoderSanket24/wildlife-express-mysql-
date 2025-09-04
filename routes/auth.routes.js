import { Router } from "express";
import { getLoginPage, getRegistrationPage, postLoginPage, postRegistrationPage } from "../controller/auth.controller.js";

const router = Router();

router.route('/register').get(getRegistrationPage).post(postRegistrationPage);
router.route('/login').get(getLoginPage).post(postLoginPage);

export const authrouter= router;