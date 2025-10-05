import { db as dbClient } from "../config/db-client.js";

export const loadVisitorsInfo = async () => {
    const [rows] = await dbClient.execute('select * from visitors');
    return rows;
}

export const loadTicketsInfo = async () => {
    const [rows] = await dbClient.execute('select * from tickets');
    return rows;
}

export const loadFeedbacks = async () => {
    const [rows] = await dbClient.execute('SELECT * FROM feedbacks ORDER BY submitted_at DESC');
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

export const submitFeedback = async (formData) => {
    const query = `
        INSERT INTO feedback (
            name, email, visit_date, ticket_id, 
            rating_overall, rating_guide, rating_facility, 
            sightings, liked_most, comments, recommend
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        formData.name,
        formData.email,
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

    const [result] = await dbClient.execute(query, values);
    return result;
}

export const loadZones = async () => {
    const [rows] = await dbClient.execute('select * from zones');
    return rows;
}

export const totalAreasCount = async () => {
    const [rows] = await dbClient.execute('select sum(area) as total from zones');
    return rows[0].total;
}

export const totalCameraTrapsCount = async () => {
    const [rows] = await dbClient.execute('select sum(camera_traps) as total from zones');
    return rows[0].total;
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

export const createBooking = async (bookingData) => {
    const query = `
        INSERT INTO tickets (
            booking_id, 
            visitor_name, 
            contact_number, 
            safari_date, 
            time_slot, 
            safari_zone, 
            person_count, 
            has_guide, 
            has_camera, 
            has_lunch, 
            has_transport, 
            base_cost, 
            services_cost, 
            gst_amount, 
            total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        bookingData.booking_id,
        bookingData.visitor_name,
        bookingData.contact_number,
        bookingData.safari_date,
        bookingData.time_slot,
        bookingData.safari_zone,
        bookingData.person_count,
        bookingData.has_guide ? 1 : 0,
        bookingData.has_camera ? 1 : 0,
        bookingData.has_lunch ? 1 : 0,
        bookingData.has_transport ? 1 : 0,
        bookingData.base_cost,
        bookingData.services_cost,
        bookingData.gst_amount,
        bookingData.total_amount
    ];

    const [result] = await dbClient.execute(query, values);
    return { success: true, insertId: result.insertId, bookingId: bookingData.booking_id };
};