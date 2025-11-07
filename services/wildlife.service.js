import { vi } from "zod/locales";
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

export const loadAnimals = async () => {
    const [rows] = await dbClient.execute('select * from animals');
    return rows;
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
    const [rows] = await dbClient.execute('insert into animals (name, species_id, status, count, habitat_zone, last_survey, image_url) values (?, ?, ?, ?, ?, ?, ?)', [name, species_id, status, count, habitat_zone, last_survey, image_url]);
    return rows;
}

export const loadStaff = async () => {
    const [rows] = await dbClient.execute('select * from rangers_staff');
    return rows;
}

export const addStaff = async (staffData) => {
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

    try {
        const [result] = await dbClient.execute(
            `INSERT INTO rangers_staff 
            (employee_id, employee_name, age, gender, assigned_zone, experience_years, shift, role, category) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employee_id, employee_name, age, gender, assigned_zone, experience_years, shift, role, category]
        );

        return {
            success: true,
            message: 'Staff member registered successfully!',
            employeeId: employee_id,
            insertId: result.insertId
        };
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

export const medical_checkups = async () => {
    const [rows] = await dbClient.execute('select * from medical_checkups');
    return rows;
}

export const medical_treatments = async () => {
    const [rows] = await dbClient.execute('select * from medical_treatments');
    return rows;
}

export const feeding_logs = async () => {
    const [rows] = await dbClient.execute('select * from feeding_logs');
    return rows;
}

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