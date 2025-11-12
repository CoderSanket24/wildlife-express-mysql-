import { addAnimal, loadAnimals, loadFeedbacks, loadStaff, loadTicketsInfo, loadVisitorsInfo, loadZones, submitFeedback, createBooking, totalAnimalsCount, totalSpeciesCount, avgRating, recommendRating, medical_checkups, medical_treatments, feeding_logs, getBookingsByEmail, getFeedbacksByEmail, addZone, zoneDetails, getFilteredZones, getZoneFilterOptions, getStaffFilterOptions, getAnimalFilterOptions, getMedicalFilterOptions, addStaff, addMedicalCheckup, addMedicalTreatment, addFeedingLog } from "../services/wildlife.service.js";
import { getVisitorByEmail } from "../services/auth.service.js";
import { getComprehensiveDashboardData, getDashboardStats, updateAnalyticsSummary } from "../services/visitor-analytics.service.js";
import { db as dbClient } from "../config/db-client.js";

export const getHomePage = async (req, res) => {
    try {
        const totalAnimals = await totalAnimalsCount();
        const speciesCount = await totalSpeciesCount();
        const ZoneDetails = await zoneDetails();
        const totalAreas = ZoneDetails.total_area;
        const totalCameraTraps = ZoneDetails.total_cameras;

        return res.render("index", { totalAnimals, speciesCount, totalAreas, totalCameraTraps });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getVisitorPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');

        // Update analytics summary before loading dashboard
        await updateAnalyticsSummary();

        // Get comprehensive dashboard data using optimized database views
        const dashboardData = await getComprehensiveDashboardData();

        // Get raw data for tables (limited for performance)
        const visitors_info = await loadVisitorsInfo();
        const tickets = await loadTicketsInfo();

        // Extract statistics and chart data
        const { statistics, charts } = dashboardData;

        return res.render("visitors", {
            visitors_info: visitors_info.slice(0, 50), // Limit for performance
            tickets: tickets.slice(0, 50), // Limit for performance
            totalVisitors: statistics.registered_visitors,
            chartData: {
                ageDistribution: charts.ageDistribution,
                zonePopularity: charts.zonePopularity,
                revenueData: charts.revenueData,
                statusData: charts.statusData,
                timeSlotData: charts.timeSlotData,
                visitorTrends: {
                    labels: charts.revenueData.labels,
                    data: charts.revenueData.visitors.map(v => parseInt(v) || 0)
                },
                statistics: {
                    totalRevenue: parseFloat(statistics.total_revenue) || 0,
                    monthlyVisitors: parseInt(statistics.month_visitors) || 0,
                    todayVisitors: parseInt(statistics.today_visitors) || 0
                }
            }
        });
    } catch (error) {
        console.error('Error loading visitor dashboard:', error);
        return res.status(500).send("Internal server error.");
    }
}

export const getAnimalsPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        
        // Get filter parameters from query string
        const filters = {
            status: req.query.status || '',
            habitat_zone: req.query.habitat_zone || '',
            min_count: req.query.min_count ? parseInt(req.query.min_count) : null,
            max_count: req.query.max_count ? parseInt(req.query.max_count) : null,
            search: req.query.search || '',
            sort_by: req.query.sort_by || 'name',
            sort_order: req.query.sort_order || 'ASC'
        };
        
        // Get filtered animal data
        const animals = await loadAnimals(filters);
        const totalSpecies = new Set(animals.map(animal => animal.species_id)).size;
        const totalAnimals = animals.reduce((acc, animal) => acc + animal.count, 0);
        const endangeredCount = animals.filter(animal => animal.status.toLowerCase() === 'endangered').length;
        
        // Get filter options for dropdowns
        const filterOptions = await getAnimalFilterOptions();
        
        return res.render("animals", { 
            animals, 
            totalSpecies, 
            totalAnimals, 
            endangeredCount,
            filters,
            filterOptions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getAddAnimalPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/addAnimal");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postAddAnimalPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');

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
        if (!req.user) return res.redirect('/');
        
        // Get filter parameters from query string
        const checkupFilters = {
            health_status: req.query.health_status || '',
            vaccination_status: req.query.vaccination_status || '',
            animal_id: req.query.checkup_animal_id || '',
            search: req.query.checkup_search || '',
            sort_by: req.query.checkup_sort_by || 'checkup_date',
            sort_order: req.query.checkup_sort_order || 'DESC'
        };
        
        const treatmentFilters = {
            treatment_progress: req.query.treatment_progress || '',
            condition: req.query.condition || '',
            animal_id: req.query.treatment_animal_id || '',
            search: req.query.treatment_search || '',
            sort_by: req.query.treatment_sort_by || 'treatment_start_date',
            sort_order: req.query.treatment_sort_order || 'DESC'
        };
        
        const feedingFilters = {
            food_type: req.query.food_type || '',
            staff_id: req.query.staff_id || '',
            schedule_name: req.query.schedule_name || '',
            search: req.query.feeding_search || '',
            sort_by: req.query.feeding_sort_by || 'feeding_date',
            sort_order: req.query.feeding_sort_order || 'DESC'
        };
        
        // Get filtered data
        const checkups = await medical_checkups(checkupFilters);
        const treatments = await medical_treatments(treatmentFilters);
        const logs = await feeding_logs(feedingFilters);
        
        // Get filter options for dropdowns
        const filterOptions = await getMedicalFilterOptions();

        res.render("medical", {
            checkups,
            treatments,
            logs,
            checkupFilters,
            treatmentFilters,
            feedingFilters,
            filterOptions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getStaffPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        
        // Get filter parameters from query string
        const filters = {
            role: req.query.role || '',
            category: req.query.category || '',
            shift: req.query.shift || '',
            gender: req.query.gender || '',
            assigned_zone: req.query.assigned_zone || '',
            min_experience: req.query.min_experience ? parseInt(req.query.min_experience) : null,
            max_experience: req.query.max_experience ? parseInt(req.query.max_experience) : null,
            search: req.query.search || '',
            sort_by: req.query.sort_by || 'employee_name',
            sort_order: req.query.sort_order || 'ASC'
        };
        
        // Get filtered staff data
        const staff = await loadStaff(filters);
        const activeStaff = staff.length;
        
        // Get filter options for dropdowns
        const filterOptions = await getStaffFilterOptions();
        
        return res.render("staff", { 
            staff, 
            activeStaff,
            filters,
            filterOptions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getZonesPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        
        // Get filter parameters from query string
        const filters = {
            access_level: req.query.access_level || '',
            climate: req.query.climate || '',
            min_area: req.query.min_area ? parseFloat(req.query.min_area) : null,
            max_area: req.query.max_area ? parseFloat(req.query.max_area) : null,
            min_cameras: req.query.min_cameras ? parseInt(req.query.min_cameras) : null,
            max_cameras: req.query.max_cameras ? parseInt(req.query.max_cameras) : null,
            search: req.query.search || '',
            sort_by: req.query.sort_by || 'zone_name',
            sort_order: req.query.sort_order || 'ASC'
        };
        
        // Get filtered zone data
        const zones = await getFilteredZones(filters);
        const activeZones = zones.length;
        
        // Get basic zone details (unfiltered for totals)
        const ZoneDetails = await zoneDetails();
        const totalArea = ZoneDetails.total_area;
        const totalCameraTraps = ZoneDetails.total_cameras;
        
        // Get filter options for dropdowns
        const filterOptions = await getZoneFilterOptions();
        
        return res.render("zones", { 
            zones, 
            activeZones, 
            totalArea, 
            totalCameraTraps,
            filters,
            filterOptions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getAddZonesPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/addZone");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postAddZonesPage = async (req, res) => {
    try {
        const zoneData = req.body;
        const result = await addZone(zoneData);
        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to Add Zone." });
    }
}

export const getFeedbackPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
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
        await submitFeedback(formData, req.user.id);
        return res.status(200).json({ success: true, message: "Feedback submitted successfully." });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(500).json({ success: false, message: 'Booking Id does not exists.' });
        return res.status(500).json({ success: false, message: error.sqlMessage });
    }
}

export const getBookingPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/ticket-booking");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postBookingPage = async (req, res) => {
    try {
        const bookingData = req.body;
        const result = await createBooking(bookingData, req.user.email);
        return res.status(201).json({ success: true, message: result.message, bookingId: result.bookingId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to create booking." });
    }
};

export const getUserProfilePage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        const user = await getVisitorByEmail(req.user.email);
        const bookings = await getBookingsByEmail(req.user.email);
        const feedbacks = await getFeedbacksByEmail(req.user.email);

        return res.render("user-profile", { user, bookings, feedbacks });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getVisitorsFeedbackPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/'); // Ensure user is logged in

        const { rating, sortBy, search } = req.query;
        const filters = { rating, sortBy, search };

        const feedbacks = await loadFeedbacks(filters);
        const totalFeedbacks = feedbacks.length;
        const averageRatingResult = await avgRating();
        const averageRating = averageRatingResult ? parseFloat(averageRatingResult).toFixed(1) : "0.00";
        const recommendRatingResult = await recommendRating();
        const recommendRatingPercentage = totalFeedbacks > 0 ? ((recommendRatingResult / totalFeedbacks) * 100).toFixed(1) : 0;
        const thisMonthFeedbacks = feedbacks.filter(feedback => {
            const submittedDate = new Date(feedback.submitted_at);
            const now = new Date();
            return submittedDate.getMonth() === now.getMonth() && submittedDate.getFullYear() === now.getFullYear();
        }).length;
        return res.render("visitors-feedback", {
            feedbacks,
            totalFeedbacks,
            averageRating,
            recommendRatingPercentage,
            thisMonthFeedbacks,
            filters // Pass filters to the template
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const getZoneDetailsAPI = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const { zoneId } = req.params;
        const [zones] = await dbClient.execute('SELECT * FROM zones WHERE zone_id = ?', [zoneId]);
        
        if (zones.length === 0) {
            return res.status(404).json({ success: false, message: 'Zone not found' });
        }
        
        return res.json({ success: true, zone: zones[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getAddStaffPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/addStaff");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
}

export const postAddStaffPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');

        const staffData = req.body;

        // Validate required fields
        if (!staffData.employee_id || !staffData.employee_name || !staffData.age) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: Employee ID, Name, and Age are mandatory.' 
            });
        }

        const result = await addStaff(staffData);

        return res.status(201).json({ 
            success: result.success, 
            message: result.message,
            employeeId: result.employeeId
        });
    } catch (error) {
        console.error('Error adding staff:', error);
        
        if (error.message.includes('Employee ID already exists')) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: error.sqlMessage 
        });
    }
};

// Medical Forms Pages
export const getAddMedicalCheckupPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/addMedicalCheckup");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
};

export const getAddTreatmentPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/addTreatment");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
};

export const getAddFeedingLogPage = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/');
        return res.render("forms/addFeedingLog");
    } catch (error) {
        console.error(error);
        return res.status(500).send("internal server error.");
    }
};

// API Endpoints
export const getAnimalsAPI = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        // Query to get animals with proper id and name fields
        const [animals] = await dbClient.execute('SELECT id, name, species_id FROM animals ORDER BY name');
        return res.json(animals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getStaffAPI = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        // Query to get staff with proper fields
        const [staff] = await dbClient.execute('SELECT employee_id, employee_name FROM rangers_staff ORDER BY employee_name');
        return res.json(staff);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const postMedicalCheckup = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const checkupData = req.body;
        const result = await addMedicalCheckup(checkupData);
        
        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        console.error('Error adding medical checkup:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.sqlMessage || error.message || 'Failed to add medical checkup.' 
        });
    }
};

export const postMedicalTreatment = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const treatmentData = req.body;
        const result = await addMedicalTreatment(treatmentData);
        
        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        console.error('Error adding medical treatment:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.sqlMessage || error.message || 'Failed to add medical treatment.' 
        });
    }
};

export const postFeedingLog = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const feedingData = req.body;
        const result = await addFeedingLog(feedingData);
        
        return res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        console.error('Error adding feeding log:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.sqlMessage || error.message || 'Failed to add feeding log.' 
        });
    }
};
