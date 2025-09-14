import { db } from "../config/db.js";
import { visitorsInfo, zones } from "../drizzle/schema.js";

export const loadVisitorsInfo = async () => {
    const rows = await db.select().from(visitorsInfo);
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

export const loadZones = async () => {
        const rows = await db.select().from(zones);
        return rows;
}