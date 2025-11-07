import { Router } from "express";
import { postAddAnimalPage, getAnimalsPage, getBookingPage, getFeedbackPage, getHomePage, getMedicalPage, getStaffPage, getVisitorPage, getZonesPage, postFeedbackPage, postBookingPage, getAddAnimalPage, getUserProfilePage, getVisitorsFeedbackPage, postAddZonesPage, getAddZonesPage, getZoneDetailsAPI, getAddStaffPage, postAddStaffPage } from "../controller/wildlife.controller.js";
import upload from '../middlewares/upload-middleware.js';

const router = Router();

router.get('/',getHomePage);
router.get('/visitors',getVisitorPage);
router.get('/animals',getAnimalsPage);
router.route('/addAnimal').get(getAddAnimalPage).post(upload, postAddAnimalPage);
router.get('/medical',getMedicalPage);
router.get('/staff',getStaffPage);
router.route('/addStaff').get(getAddStaffPage).post(postAddStaffPage);
router.route('/zones').get(getZonesPage);
router.route('/addZone').get(getAddZonesPage).post(postAddZonesPage);
router.route("/feedback").get(getFeedbackPage).post(postFeedbackPage);
router.route('/booking').get(getBookingPage).post(postBookingPage);
router.route('/user-profile').get(getUserProfilePage);
router.route('/visitors-feedback').get(getVisitorsFeedbackPage);
router.get('/api/zones/details/:zoneId', getZoneDetailsAPI);

export default router;