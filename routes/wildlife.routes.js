import { Router } from "express";
import { addAnimalPage, getAnimalsPage, getBookingPage, getFeedbackPage, getHomePage, getMedicalPage, getStaffPage, getVisitorPage, getZonesPage } from "../controller/wildlife.controller.js";

const router = Router();

router.get('/',getHomePage);
router.get('/visitors',getVisitorPage);
router.get('/animals',getAnimalsPage);
router.post('/animals',addAnimalPage);
router.get('/medical',getMedicalPage);
router.get('/staff',getStaffPage);
router.get('/zones',getZonesPage);
router.get('/feedback',getFeedbackPage);
router.get('/booking',getBookingPage);

export default router;