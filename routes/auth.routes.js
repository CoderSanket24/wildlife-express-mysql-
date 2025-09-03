import { Router } from "express";
import { getRegistrationPage } from "../controller/auth.controller.js";

const router = Router();

router.route('/register').get(getRegistrationPage);

export const authrouter= router;