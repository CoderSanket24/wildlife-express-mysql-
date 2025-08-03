import { db } from "../config/db-client.js";

export const loadVisitorsInfo = async () => {
    const [rows] = await db.execute('select * from visitors_info');
    return rows;
}

export const loadTicketsInfo = async () => {
    const [rows] = await db.execute('select * from tickets');
    return rows;
}

export const loadFeedbacks = async () => {
    const [rows] = await db.execute('select * from feedbacks');
    return rows;
}