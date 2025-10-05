import { addAnimal, loadAnimals, loadFeedbacks, loadStaff, loadTicketsInfo, loadVisitorsInfo, loadZones, submitFeedback, createBooking, totalAnimalsCount, totalSpeciesCount, totalAreasCount, totalCameraTrapsCount, avgRating, recommendRating } from "../services/wildlife.service.js";
import {getVisitorByEmail} from "../services/auth.service.js";

export const getHomePage = async (req, res) => {
    try {
        const totalAnimals = await totalAnimalsCount();
        const speciesCount = await totalSpeciesCount();
        const totalAreas = await totalAreasCount();
        const totalCameraTraps = await totalCameraTrapsCount();
        return res.render("index", { totalAnimals, speciesCount, totalAreas, totalCameraTraps });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getVisitorPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        const visitors_info = await loadVisitorsInfo();
        const totalVisitors = visitors_info.length;
        const tickets = await loadTicketsInfo();
        return res.render("visitors",{visitors_info,tickets,totalVisitors});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
} 

export const getAnimalsPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        const animals = await loadAnimals();
        const totalSpecies = new Set(animals.map(animal => animal.species_id)).size;
        const totalAnimals = animals.reduce((acc, animal) => acc + animal.count, 0);
        const endangeredCount = animals.filter(animal => animal.status.toLowerCase() === 'endangered').length;
        return res.render("animals",{animals,totalSpecies,totalAnimals,endangeredCount});
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getAddAnimalPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        return res.render("forms/addAnimal");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postAddAnimalPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');

        const { name, species_id, status, count, habitat_zone, last_survey } = req.body;
        const image_url = req.file ? `${req.file.path.replace(/\\/g, '/').replace('public/images/', '')}` : null;

        if (!name || !species_id || !status || !count || !habitat_zone || !last_survey) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }

        await addAnimal(name, species_id, status, count, habitat_zone, last_survey, image_url);

        return res.status(201).json({ success: true, message: 'Animal added successfully!', species_id: species_id });
    } catch (error) {
        console.error('Error adding animal:', error);
        return res.status(500).json({ success: false, message: 'Failed to add animal record.' });
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

export const postBookingPage = async (req, res) => {
    try {
        const bookingData = req.body;
        const result = await createBooking(bookingData);
        return res.status(201).json({ success: true, message: "Booking created successfully.", bookingId: result.bookingId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to create booking." });
    }
};

export const getUserProfilePage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/');
        const user = await getVisitorByEmail(req.user.email);
        return res.render("user-profile", { user });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getVisitorsFeedbackPage = async (req, res) => {
    try {
        if(!req.user) return res.redirect('/'); // Ensure user is logged in
        const feedbacks = await loadFeedbacks();
        const totalFeedbacks = feedbacks.length;
        const averageRatingResult = await avgRating();
        const averageRating = averageRatingResult ? parseFloat(averageRatingResult).toFixed(1) : "0.00";
        const recommendRatingResult = await recommendRating();
        const recommendRatingPercentage = (recommendRatingResult / totalFeedbacks) * 100;
        const thisMonthFeedbacks = feedbacks.filter(feedback => {
            const submittedDate = new Date(feedback.submitted_at);
            const now = new Date();
            return submittedDate.getMonth() === now.getMonth() && submittedDate.getFullYear() === now.getFullYear();
        }).length;
        return res.render("visitors-feedback", { feedbacks, totalFeedbacks, averageRating, recommendRatingPercentage, thisMonthFeedbacks });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }       
}