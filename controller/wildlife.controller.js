import path from "path";
import { loadFeedbacks, loadTicketsInfo, loadVisitorsInfo } from "../models/wildlife.model.js";

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