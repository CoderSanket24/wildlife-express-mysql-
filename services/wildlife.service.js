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
    const [rows] = await dbClient.execute('select * from feedbacks');
    return rows;
}

export const loadZones = async () => {
    const [rows] = await dbClient.execute('select * from zones');
    return rows;
}

export const loadAnimals = async () => {
    const [rows] = await dbClient.execute('select * from animals');
    return rows;
}

export const addAnimal = async (name, species_id, status, count, habitat_zone, last_survey, image_url) => {
    const [rows] = await dbClient.execute('insert into animals (name, species_id, status, count, habitat_zone, last_survey, image_url) values (?, ?, ?, ?, ?, ?, ?)', [name, species_id, status, count, habitat_zone, last_survey, image_url]);
    return rows;
}

export const loadStaff = async () => {
    const [rows] = await dbClient.execute('select * from rangers_staff');
    return rows;
}