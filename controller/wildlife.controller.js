import path from "path";
import { loadFeedbacks, loadTicketsInfo, loadVisitorsInfo, loadZones } from "../models/wildlife.model.js";

export const getHomePage = async (req, res) => {
    try {
        return res.sendFile(path.join(import.meta.dirname, '../index.html'));
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getVisitorPage = async (req, res) => {
    try {
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
        return res.render("animals");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getMedicalPage = async (req, res) => {
    try {
        return res.render("medical");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getStaffPage = async (req, res) => {
    try {
        return res.render("staff");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getZonesPage = async (req, res) => {
    try {
        const zones = await loadZones();
        return res.render("zones",{zones});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getFeedbackPage = async (req, res) => {
    try {
        return res.render("feedback");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getBookingPage = async (req, res) => {
    try {
        return res.render("ticket-booking");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}