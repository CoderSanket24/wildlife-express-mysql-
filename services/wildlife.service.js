import { db as dbClient } from "../config/db-client.js";

export const loadVisitorsInfo = async () => {
    const [rows] = await dbClient.execute('select * from visitors');
    return rows;
}

export const loadTicketsInfo = async () => {
    const [rows] = await dbClient.execute(`
        SELECT 
            t.*,
            v.name as visitor_name,
            v.email as visitor_email
        FROM tickets t
        LEFT JOIN visitors v ON t.visitor_id = v.id
        ORDER BY t.safari_date DESC
    `);
    return rows;
}

export const loadFeedbacks = async (filters = {}) => {
    let query = `
        SELECT
            v.name,
            f.visit_date,
            f.booking_id,
            f.rating_overall,
            f.rating_guide,
            f.rating_facility,
            f.sightings,
            f.comments,
            f.recommend,
            f.submitted_at
        FROM feedbacks f
        INNER JOIN visitors v ON f.visitor_id = v.id
    `;

    const whereClauses = [];
    const queryParams = [];

    if (filters.rating) {
        whereClauses.push('f.rating_overall = ?');
        queryParams.push(filters.rating);
    }

    if (filters.search) {
        whereClauses.push('(v.name LIKE ? OR f.booking_id LIKE ? OR f.comments LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    if (filters.sortBy === 'recent') {
        query += ' ORDER BY f.submitted_at DESC';
    } else {
        query += ' ORDER BY f.submitted_at DESC'; // Default sort
    }
    
    const [rows] = await dbClient.execute(query, queryParams);
    return rows;
}

export const avgRating = async () => {
    const [rows] = await dbClient.execute('SELECT AVG(rating_overall) AS avg_rating FROM feedbacks');
    return rows[0].avg_rating;
}

export const recommendRating = async () => {
    const [rows] = await dbClient.execute('SELECT * FROM feedbacks WHERE recommend="yes"');
    return rows.length;
}

export const submitFeedback = async (formData, visitorId) => {
    const query = `
        INSERT INTO feedbacks (
            visitor_id, visit_date, booking_id, 
            rating_overall, rating_guide, rating_facility, 
            sightings, liked_most, comments, recommend
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        visitorId,
        formData.visitDate,
        formData.ticketId || null,
        formData.ratings.overall,
        formData.ratings.guide,
        formData.ratings.facility,
        JSON.stringify(formData.sightings),
        JSON.stringify(formData.likedMost),
        formData.comments,
        formData.recommend
    ];

    await dbClient.execute(query, values);
}

export const loadZones = async () => {
    const [rows] = await dbClient.execute('select * from zones');
    return rows;
}

export const addZone = async (zoneData) => {
    const procedureCallQuery = `CALL sp_AddZone_V2(?, ?, ?, ?, ?, ?, ?, @statusMessage);`;

    const values = [
        zoneData.zone_id,
        zoneData.zone_name,
        zoneData.area,
        zoneData.climate,
        zoneData.camera_traps,
        zoneData.access_level,
        zoneData.primary_species,
    ];

    await dbClient.execute(procedureCallQuery, values);
    const result = await dbClient.execute('SELECT @statusMessage AS message;');
    return { success: true, message: result[0][0].message };
}

export const zoneDetails = async () => {
    const [rows] = await dbClient.execute(`
        SELECT
            SUM(area) AS total_area,
            SUM(camera_traps) AS total_cameras
        FROM zones;
    `)
    console.log(rows[0]);
    return rows[0];
}

export const loadAnimals = async (filters = {}) => {
    try {
        let query = 'SELECT * FROM animals WHERE 1=1';
        const params = [];
        
        // Apply filters
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        
        if (filters.habitat_zone) {
            query += ' AND habitat_zone = ?';
            params.push(filters.habitat_zone);
        }
        
        if (filters.min_count !== null) {
            query += ' AND count >= ?';
            params.push(filters.min_count);
        }
        
        if (filters.max_count !== null) {
            query += ' AND count <= ?';
            params.push(filters.max_count);
        }
        
        if (filters.search) {
            query += ' AND (name LIKE ? OR species_id LIKE ? OR habitat_zone LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Apply sorting
        const validSortColumns = ['name', 'species_id', 'status', 'count', 'habitat_zone', 'last_survey'];
        const sortBy = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'name';
        const sortOrder = filters.sort_order === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        const [rows] = await dbClient.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error filtering animals:', error);
        return [];
    }
}

export const totalAnimalsCount = async () => {
    const [rows] = await dbClient.execute('select sum(count) as total from animals');
    return rows[0].total;
}

export const totalSpeciesCount = async () => {
    const [rows] = await dbClient.execute('select count(distinct species_id) as total from animals');
    return rows[0].total;
}

export const addAnimal = async (name, species_id, status, count, habitat_zone, last_survey, image_url) => {
    const procedureCallQuery = `CALL sp_LogAnimalSurvey(?, ?, ?, ?, ?, ?, ?);`;
    const values = [species_id, name, status, count, habitat_zone, last_survey, image_url];
    await dbClient.execute(procedureCallQuery, values);
}

export const loadStaff = async (filters = {}) => {
    try {
        let query = `
            SELECT 
                rs.*,
                z.zone_name as assigned_zone_name
            FROM rangers_staff rs
            LEFT JOIN zones z ON rs.assigned_zone = z.zone_id
            WHERE 1=1
        `;
        const params = [];
        
        // Apply filters
        if (filters.role) {
            query += ' AND rs.role = ?';
            params.push(filters.role);
        }
        
        if (filters.category) {
            query += ' AND rs.category = ?';
            params.push(filters.category);
        }
        
        if (filters.shift) {
            query += ' AND rs.shift = ?';
            params.push(filters.shift);
        }
        
        if (filters.gender) {
            query += ' AND rs.gender = ?';
            params.push(filters.gender);
        }
        
        if (filters.assigned_zone) {
            query += ' AND rs.assigned_zone = ?';
            params.push(filters.assigned_zone);
        }
        
        if (filters.min_experience !== null) {
            query += ' AND rs.experience_years >= ?';
            params.push(filters.min_experience);
        }
        
        if (filters.max_experience !== null) {
            query += ' AND rs.experience_years <= ?';
            params.push(filters.max_experience);
        }
        
        if (filters.search) {
            query += ' AND (rs.employee_name LIKE ? OR rs.employee_id LIKE ? OR z.zone_name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Apply sorting
        const validSortColumns = ['employee_name', 'employee_id', 'age', 'experience_years', 'shift', 'role', 'category'];
        const sortBy = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'employee_name';
        const sortOrder = filters.sort_order === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        const [rows] = await dbClient.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error filtering staff:', error);
        return [];
    }
}

export const addStaff = async (staffData) => {
    const procedureCallQuery = `CALL sp_HireRanger(?, ?, ?, ?, ?, ?, ?, ?, ?, @msg);`

    const {
        employee_id,
        employee_name,
        age,
        gender,
        assigned_zone,
        experience_years,
        shift,
        role,
        category
    } = staffData;

    const values = [employee_id, employee_name, age, gender, assigned_zone, experience_years, shift, role, category]

    try {
        await dbClient.execute(procedureCallQuery, values);
        const result = await dbClient.execute('SELECT @msg AS message;');
        // console.log(result);
        
        return { success: true, message: result[0][0].message, employeeId: employee_id };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Employee ID already exists. Please use a unique Employee ID.');
        }
        throw error;
    }
}

export const createBooking = async (bookingData, visitorEmail) => {
    const procedureCallQuery = `CALL BookSafariTicket(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @booking_status);`;

    const values = [
        visitorEmail,
        bookingData.safari_date,
        bookingData.time_slot,
        bookingData.safari_zone,
        bookingData.person_count,
        bookingData.base_cost,
        bookingData.has_guide ? 1 : 0,
        bookingData.has_camera ? 1 : 0,
        bookingData.has_lunch ? 1 : 0,
        bookingData.has_transport ? 1 : 0
    ];

    await dbClient.execute(procedureCallQuery, values);
    const result = await dbClient.execute('SELECT @booking_status AS message;');
    console.log(result);
    
    return { success: true, message: result[0][0].message, bookingId: bookingData.booking_id };
};

export const getBookingsByEmail = async (email) => {
    const query = `
        SELECT
            v.name,
            v.email,
            t.booking_id,
            t.safari_date,
            t.time_slot,
            t.safari_zone,
            t.person_count,
            t.total_amount
        FROM visitors v
        JOIN tickets t ON v.id = t.visitor_id
        WHERE v.email = '${email}';
    `;
    const rows = await dbClient.execute(query);
    return rows[0];
}

export const getFeedbacksByEmail = async (email) => {
    const query = `
        SELECT
            f.visit_date,
            f.booking_id,
            f.rating_overall,
            f.rating_guide,
            f.rating_facility,
            f.sightings,
            f.comments,
            f.recommend,
            f.submitted_at
        FROM feedbacks f
        INNER JOIN visitors v ON f.visitor_id = v.id
        WHERE v.email = ?
        ORDER BY f.submitted_at DESC;
    `;
    const [rows] = await dbClient.execute(query, [email]);
    return rows;
}

export const medical_checkups = async (filters = {}) => {
    try {
        let query = 'SELECT * FROM medical_checkups WHERE 1=1';
        const params = [];
        
        if (filters.health_status) {
            query += ' AND health_status = ?';
            params.push(filters.health_status);
        }
        
        if (filters.vaccination_status) {
            query += ' AND vaccination_status = ?';
            params.push(filters.vaccination_status);
        }
        
        if (filters.animal_id) {
            query += ' AND animal_id = ?';
            params.push(filters.animal_id);
        }
        
        if (filters.search) {
            query += ' AND (animal_id LIKE ? OR health_status LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }
        
        const validSortColumns = ['checkup_date', 'animal_id', 'health_status', 'weight_kg'];
        const sortBy = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'checkup_date';
        const sortOrder = filters.sort_order === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        const [rows] = await dbClient.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error filtering medical checkups:', error);
        return [];
    }
}

export const medical_treatments = async (filters = {}) => {
    try {
        let query = 'SELECT * FROM medical_treatments WHERE 1=1';
        const params = [];
        
        if (filters.treatment_progress) {
            query += ' AND treatment_progress = ?';
            params.push(filters.treatment_progress);
        }
        
        if (filters.condition) {
            query += ' AND `condition` LIKE ?';
            params.push(`%${filters.condition}%`);
        }
        
        if (filters.animal_id) {
            query += ' AND animal_id = ?';
            params.push(filters.animal_id);
        }
        
        if (filters.search) {
            query += ' AND (animal_id LIKE ? OR `condition` LIKE ? OR medication LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        const validSortColumns = ['treatment_start_date', 'animal_id', 'condition', 'treatment_progress'];
        let sortBy = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'treatment_start_date';
        if (sortBy === 'condition') sortBy = '`condition`';
        const sortOrder = filters.sort_order === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        const [rows] = await dbClient.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error filtering medical treatments:', error);
        return [];
    }
}

export const feeding_logs = async (filters = {}) => {
    try {
        let query = 'SELECT * FROM feeding_logs WHERE 1=1';
        const params = [];
        
        if (filters.food_type) {
            query += ' AND food_type = ?';
            params.push(filters.food_type);
        }
        
        if (filters.staff_id) {
            query += ' AND staff_id = ?';
            params.push(filters.staff_id);
        }
        
        if (filters.schedule_name) {
            query += ' AND schedule_name LIKE ?';
            params.push(`%${filters.schedule_name}%`);
        }
        
        if (filters.search) {
            query += ' AND (schedule_name LIKE ? OR food_type LIKE ? OR staff_id LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        const validSortColumns = ['feeding_date', 'schedule_name', 'food_type', 'quantity_kg'];
        const sortBy = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'feeding_date';
        const sortOrder = filters.sort_order === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        const [rows] = await dbClient.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error filtering feeding logs:', error);
        return [];
    }
}

export const getMedicalFilterOptions = async () => {
    try {
        // Get unique health statuses
        const [healthStatuses] = await dbClient.execute(
            'SELECT DISTINCT health_status FROM medical_checkups WHERE health_status IS NOT NULL ORDER BY health_status'
        );
        
        // Get unique vaccination statuses
        const [vaccinationStatuses] = await dbClient.execute(
            'SELECT DISTINCT vaccination_status FROM medical_checkups WHERE vaccination_status IS NOT NULL ORDER BY vaccination_status'
        );
        
        // Get unique treatment progress statuses
        const [treatmentProgress] = await dbClient.execute(
            'SELECT DISTINCT treatment_progress FROM medical_treatments WHERE treatment_progress IS NOT NULL ORDER BY treatment_progress'
        );
        
        // Get unique conditions
        const [conditions] = await dbClient.execute(
            'SELECT DISTINCT `condition` FROM medical_treatments WHERE `condition` IS NOT NULL ORDER BY `condition`'
        );
        
        // Get unique food types
        const [foodTypes] = await dbClient.execute(
            'SELECT DISTINCT food_type FROM feeding_logs WHERE food_type IS NOT NULL ORDER BY food_type'
        );
        
        // Get unique schedule names
        const [scheduleNames] = await dbClient.execute(
            'SELECT DISTINCT schedule_name FROM feeding_logs WHERE schedule_name IS NOT NULL ORDER BY schedule_name'
        );
        
        // Get animal IDs
        const [animalIds] = await dbClient.execute(
            'SELECT DISTINCT id, name FROM animals ORDER BY name'
        );
        
        // Get staff IDs
        const [staffIds] = await dbClient.execute(
            'SELECT DISTINCT employee_id, employee_name FROM rangers_staff ORDER BY employee_name'
        );
        
        return {
            healthStatuses: healthStatuses.map(row => row.health_status),
            vaccinationStatuses: vaccinationStatuses.map(row => row.vaccination_status),
            treatmentProgress: treatmentProgress.map(row => row.treatment_progress),
            conditions: conditions.map(row => row.condition),
            foodTypes: foodTypes.map(row => row.food_type),
            scheduleNames: scheduleNames.map(row => row.schedule_name),
            animalIds: animalIds,
            staffIds: staffIds
        };
    } catch (error) {
        console.error('Error getting medical filter options:', error);
        return {
            healthStatuses: [],
            vaccinationStatuses: [],
            treatmentProgress: [],
            conditions: [],
            foodTypes: [],
            scheduleNames: [],
            animalIds: [],
            staffIds: []
        };
    }
};

// Zone filtering functions
export const getFilteredZones = async (filters) => {
    try {
        let query = 'SELECT * FROM zones WHERE 1=1';
        const params = [];
        
        // Apply filters
        if (filters.access_level) {
            query += ' AND access_level = ?';
            params.push(filters.access_level);
        }
        
        if (filters.climate) {
            query += ' AND climate LIKE ?';
            params.push(`%${filters.climate}%`);
        }
        
        if (filters.min_area !== null) {
            query += ' AND area >= ?';
            params.push(filters.min_area);
        }
        
        if (filters.max_area !== null) {
            query += ' AND area <= ?';
            params.push(filters.max_area);
        }
        
        if (filters.min_cameras !== null) {
            query += ' AND camera_traps >= ?';
            params.push(filters.min_cameras);
        }
        
        if (filters.max_cameras !== null) {
            query += ' AND camera_traps <= ?';
            params.push(filters.max_cameras);
        }
        
        if (filters.search) {
            query += ' AND (zone_name LIKE ? OR zone_id LIKE ? OR primary_species LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        // Apply sorting
        const validSortColumns = ['zone_name', 'area', 'climate', 'camera_traps', 'access_level', 'zone_id'];
        const sortBy = validSortColumns.includes(filters.sort_by) ? filters.sort_by : 'zone_name';
        const sortOrder = filters.sort_order === 'DESC' ? 'DESC' : 'ASC';
        
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        
        const [rows] = await dbClient.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error filtering zones:', error);
        return [];
    }
};

export const getZoneFilterOptions = async () => {
    try {
        // Get unique access levels
        const [accessLevels] = await dbClient.execute(
            'SELECT DISTINCT access_level FROM zones WHERE access_level IS NOT NULL ORDER BY access_level'
        );
        
        // Get unique climates
        const [climates] = await dbClient.execute(
            'SELECT DISTINCT climate FROM zones WHERE climate IS NOT NULL ORDER BY climate'
        );
        
        // Get area range
        const [areaRange] = await dbClient.execute(
            'SELECT MIN(area) as min_area, MAX(area) as max_area FROM zones'
        );
        
        // Get camera range
        const [cameraRange] = await dbClient.execute(
            'SELECT MIN(camera_traps) as min_cameras, MAX(camera_traps) as max_cameras FROM zones'
        );
        
        return {
            accessLevels: accessLevels.map(row => row.access_level),
            climates: climates.map(row => row.climate),
            areaRange: areaRange[0],
            cameraRange: cameraRange[0]
        };
    } catch (error) {
        console.error('Error getting filter options:', error);
        return {
            accessLevels: [],
            climates: [],
            areaRange: { min_area: 0, max_area: 1000 },
            cameraRange: { min_cameras: 0, max_cameras: 100 }
        };
    }
};

export const getStaffFilterOptions = async () => {
    try {
        // Get unique roles
        const [roles] = await dbClient.execute(
            'SELECT DISTINCT role FROM rangers_staff WHERE role IS NOT NULL ORDER BY role'
        );
        
        // Get unique categories
        const [categories] = await dbClient.execute(
            'SELECT DISTINCT category FROM rangers_staff WHERE category IS NOT NULL ORDER BY category'
        );
        
        // Get unique shifts
        const [shifts] = await dbClient.execute(
            'SELECT DISTINCT shift FROM rangers_staff WHERE shift IS NOT NULL ORDER BY shift'
        );
        
        // Get unique genders
        const [genders] = await dbClient.execute(
            'SELECT DISTINCT gender FROM rangers_staff WHERE gender IS NOT NULL ORDER BY gender'
        );
        
        // Get zones for assignment filter
        const [zones] = await dbClient.execute(
            'SELECT zone_id, zone_name FROM zones ORDER BY zone_name'
        );
        
        // Get experience range
        const [experienceRange] = await dbClient.execute(
            'SELECT MIN(experience_years) as min_experience, MAX(experience_years) as max_experience FROM rangers_staff'
        );
        
        return {
            roles: roles.map(row => row.role),
            categories: categories.map(row => row.category),
            shifts: shifts.map(row => row.shift),
            genders: genders.map(row => row.gender),
            zones: zones,
            experienceRange: experienceRange[0]
        };
    } catch (error) {
        console.error('Error getting staff filter options:', error);
        return {
            roles: [],
            categories: [],
            shifts: [],
            genders: [],
            zones: [],
            experienceRange: { min_experience: 0, max_experience: 50 }
        };
    }
};

export const getAnimalFilterOptions = async () => {
    try {
        // Get unique statuses
        const [statuses] = await dbClient.execute(
            'SELECT DISTINCT status FROM animals WHERE status IS NOT NULL ORDER BY status'
        );
        
        // Get unique habitat zones
        const [habitatZones] = await dbClient.execute(
            'SELECT DISTINCT habitat_zone FROM animals WHERE habitat_zone IS NOT NULL ORDER BY habitat_zone'
        );
        
        // Get count range
        const [countRange] = await dbClient.execute(
            'SELECT MIN(count) as min_count, MAX(count) as max_count FROM animals'
        );
        
        return {
            statuses: statuses.map(row => row.status),
            habitatZones: habitatZones.map(row => row.habitat_zone),
            countRange: countRange[0]
        };
    } catch (error) {
        console.error('Error getting animal filter options:', error);
        return {
            statuses: [],
            habitatZones: [],
            countRange: { min_count: 0, max_count: 1000 }
        };
    }
};


// Add Medical Records
export const addMedicalCheckup = async (checkupData) => {
    try {
        const query = `
            INSERT INTO medical_checkups (
                animal_id, checkup_date, health_status, 
                weight_kg, vaccination_status, next_checkup_date
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            checkupData.animal_id,
            checkupData.checkup_date,
            checkupData.health_status,
            checkupData.weight_kg,
            checkupData.vaccination_status,
            checkupData.next_checkup_date
        ];
        
        await dbClient.execute(query, values);
        return { success: true, message: 'Medical checkup added successfully' };
    } catch (error) {
        console.error('Service error adding checkup:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new Error('Invalid animal ID. Please select a valid animal.');
        }
        throw error;
    }
};

export const addMedicalTreatment = async (treatmentData) => {
    try {
        const query = `
            INSERT INTO medical_treatments (
                animal_id, \`condition\`, treatment_start_date, 
                medication, treatment_progress, expected_recovery_date
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            treatmentData.animal_id,
            treatmentData.condition,
            treatmentData.treatment_start_date,
            treatmentData.medication,
            treatmentData.treatment_progress,
            treatmentData.expected_recovery_date
        ];
        
        await dbClient.execute(query, values);
        return { success: true, message: 'Medical treatment added successfully' };
    } catch (error) {
        console.error('Service error adding treatment:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new Error('Invalid animal ID. Please select a valid animal.');
        }
        throw error;
    }
};

export const addFeedingLog = async (feedingData) => {
    try {
        const query = `
            INSERT INTO feeding_logs (
                schedule_name, feeding_date, food_type, 
                quantity_kg, staff_id, feeding_time
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            feedingData.schedule_name,
            feedingData.feeding_date,
            feedingData.food_type,
            feedingData.quantity_kg,
            feedingData.staff_id,
            feedingData.feeding_time
        ];
        
        await dbClient.execute(query, values);
        return { success: true, message: 'Feeding log added successfully' };
    } catch (error) {
        console.error('Service error adding feeding log:', error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            throw new Error('Invalid staff ID. Please select a valid staff member.');
        }
        throw error;
    }
};
