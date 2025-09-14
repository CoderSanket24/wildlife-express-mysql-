import { loadFeedbacks, loadTicketsInfo, loadVisitorsInfo, loadZones } from "../services/wildlife.service.js";

export const getHomePage = async (req, res) => {
    try {
        return res.render("index");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getVisitorPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        const visitors_info = await loadVisitorsInfo();
        const tickets = await loadTicketsInfo();
        const feedbacks = await loadFeedbacks();
        return res.render("visitors",{visitors_info,tickets,feedbacks});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
} 

export const getAnimalsPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("animals");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getMedicalPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("medical");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getStaffPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("staff");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getZonesPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        const zones = await loadZones();
        const activeZones = zones.length;
        const totalArea = zones.reduce((acc, zone) => acc + zone.area, 0);
        const totalCameraTraps = zones.reduce((acc, zone) => acc + zone.cameraTraps, 0);
        return res.render("zones",{zones,activeZones,totalArea,totalCameraTraps});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getFeedbackPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("feedback");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getBookingPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("ticket-booking");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}