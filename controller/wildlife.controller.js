import { addAnimal, loadAnimals, loadFeedbacks, loadStaff, loadTicketsInfo, loadVisitorsInfo, loadZones, submitFeedback } from "../services/wildlife.service.js";

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
        const animals = await loadAnimals();
        return res.render("animals",{animals});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const addAnimalPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        const { name, species_id, status, count, habitat_zone, last_survey, image_url } = req.body;
        await addAnimal(name, species_id, status, count, habitat_zone, last_survey, image_url);
        return res.redirect('/animals');
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
        const staff = await loadStaff();
        const activeStaff = staff.length;
        return res.render("staff",{staff,activeStaff});
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
        const totalCameraTraps = zones.reduce((acc, zone) => acc + zone.camera_traps, 0);
        return res.render("zones",{zones,activeZones,totalArea,totalCameraTraps});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getFeedbackPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("forms/feedback");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postFeedbackPage = async (req, res) => {
    try {
        // The user does not need to be logged in to submit feedback.
        const formData = req.body;;
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.visitDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        await submitFeedback(formData);
        return res.status(200).json({ success: true, message: "Feedback submitted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to submit feedback." });
    }
}

export const getBookingPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("forms/ticket-booking");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}