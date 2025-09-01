import { Router } from "express";
import { getAnimalsPage, getHomePage, getMedicalPage, getStaffPage, getVisitorPage, getZonesPage } from "../controller/wildlife.controller.js";

const router = Router();

router.get('/',getHomePage);
router.get('/visitors.html',getVisitorPage);
router.get('/animals.html',getAnimalsPage);
router.get('/medical.html',getMedicalPage);
router.get('/staff.html',getStaffPage);
router.get('/zones.html',getZonesPage);

export default router;