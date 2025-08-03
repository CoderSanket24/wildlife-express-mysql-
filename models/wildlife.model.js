import { db } from "../config/db-client.js";

export const loadVisitorsInfo = async () => {
    const [rows] = await db.execute('select * from visitors_info');
    return rows;
}