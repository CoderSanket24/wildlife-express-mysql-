import { Router } from "express";
import { postAddAnimalPage, getAnimalsPage, getBookingPage, getFeedbackPage, getHomePage, getMedicalPage, getStaffPage, getVisitorPage, getZonesPage, postFeedbackPage, postBookingPage, getAddAnimalPage, getUserProfilePage, getVisitorsFeedbackPage } from "../controller/wildlife.controller.js";
import upload from '../middlewares/upload-middleware.js';

const router = Router();

router.get('/',getHomePage);
router.get('/visitors',getVisitorPage);
router.get('/animals',getAnimalsPage);
router.route('/addAnimal').get(getAddAnimalPage).post(upload, postAddAnimalPage);
router.get('/medical',getMedicalPage);
router.get('/staff',getStaffPage);
router.get('/zones',getZonesPage);
router.route("/feedback").get(getFeedbackPage).post(postFeedbackPage);
router.route('/booking').get(getBookingPage).post(postBookingPage);
router.route('/user-profile').get(getUserProfilePage);
router.route('/visitors-feedback').get(getVisitorsFeedbackPage);

export default router;