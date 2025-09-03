import { Router } from "express";
import { getAnimalsPage, getHomePage, getMedicalPage, getStaffPage, getVisitorPage, getZonesPage } from "../controller/wildlife.controller.js";

const router = Router();

router.get('/',getHomePage);
router.get('/visitors',getVisitorPage);
router.get('/animals',getAnimalsPage);
router.get('/medical',getMedicalPage);
router.get('/staff',getStaffPage);
router.get('/zones',getZonesPage);

export default router;