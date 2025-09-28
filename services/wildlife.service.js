import { db as dbClient } from "../config/db-client.js";

export const loadVisitorsInfo = async () => {
    const [rows] = await dbClient.execute('select * from visitors_info');
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