import { db as dbClient } from "../config/db-client.js";

/**
 * Visitor Analytics Service using Database Views and Indexes
 * This service leverages pre-created database views for optimal performance
 */

// =====================================================
// DASHBOARD STATISTICS (Using Views)
// =====================================================

export const getDashboardStats = async () => {
    try {
        // Get the base stats from the view
        const [rows] = await dbClient.execute('SELECT * FROM v_dashboard_stats LIMIT 1');
        const baseStats = rows[0] || {};

        // Get real-time today's data using JavaScript date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

        const [todayData] = await dbClient.execute(`
            SELECT 
                COUNT(*) as real_today_bookings,
                COALESCE(SUM(person_count), 0) as real_today_visitors,
                COALESCE(SUM(total_amount), 0) as real_today_revenue
            FROM tickets 
            WHERE DATE(safari_date) = ? AND booking_status != 'cancelled'
        `, [todayStr]);

        const realTodayStats = todayData[0] || {
            real_today_bookings: 0,
            real_today_visitors: 0,
            real_today_revenue: 0
        };

        return {
            today_bookings: realTodayStats.real_today_bookings,
            today_visitors: realTodayStats.real_today_visitors,
            today_revenue: realTodayStats.real_today_revenue,
            month_bookings: baseStats.month_bookings || 0,
            month_visitors: baseStats.month_visitors || 0,
            month_revenue: baseStats.month_revenue || 0,
            total_bookings: baseStats.total_bookings || 0,
            total_visitors: baseStats.total_visitors || 0,
            total_revenue: baseStats.total_revenue || 0,
            registered_visitors: baseStats.registered_visitors || 0
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return {
            today_bookings: 0,
            today_visitors: 0,
            today_revenue: 0,
            month_bookings: 0,
            month_visitors: 0,
            month_revenue: 0,
            total_bookings: 0,
            total_visitors: 0,
            total_revenue: 0,
            registered_visitors: 0
        };
    }
};

// =====================================================
// CHART DATA (Using Views)
// =====================================================

export const getAgeDistribution = async () => {
    try {
        const [rows] = await dbClient.execute('SELECT * FROM v_age_distribution');
        if (!rows || rows.length === 0) {
            return { labels: [], data: [] };
        }
        return {
            labels: rows.map(row => row.age_group),
            data: rows.map(row => row.visitor_count)
        };
    } catch (error) {
        console.error('Error getting age distribution:', error);
        return { labels: [], data: [] };
    }
};

export const getZonePopularity = async () => {
    try {
        const [rows] = await dbClient.execute('SELECT * FROM v_zone_popularity');
        if (!rows || rows.length === 0) {
            return { labels: [], data: [], visitors: [], revenue: [] };
        }
        return {
            labels: rows.map(row => row.safari_zone),
            data: rows.map(row => row.booking_count),
            visitors: rows.map(row => row.total_visitors),
            revenue: rows.map(row => parseFloat(row.total_revenue || 0))
        };
    } catch (error) {
        console.error('Error getting zone popularity:', error);
        return { labels: [], data: [], visitors: [], revenue: [] };
    }
};

export const getDailyRevenue = async (days = 30) => {
    try {
        // Use string interpolation for better compatibility
        const [rows] = await dbClient.execute(
            `SELECT * FROM v_daily_revenue WHERE date >= DATE_SUB(CURDATE(), INTERVAL ${parseInt(days)} DAY) ORDER BY date ASC`
        );

        if (!rows || rows.length === 0) {
            return {
                labels: [],
                data: [],
                visitors: [],
                bookings: []
            };
        }

        return {
            labels: rows.map(row => new Date(row.date).toLocaleDateString()),
            data: rows.map(row => parseFloat(row.daily_revenue || 0)),
            visitors: rows.map(row => parseInt(row.daily_visitors) || 0),
            bookings: rows.map(row => parseInt(row.booking_count) || 0)
        };
    } catch (error) {
        console.error('Error getting daily revenue:', error);
        return {
            labels: [],
            data: [],
            visitors: [],
            bookings: []
        };
    }
};

export const getBookingStatus = async () => {
    try {
        const [rows] = await dbClient.execute('SELECT * FROM v_booking_status');
        if (!rows || rows.length === 0) {
            return { labels: [], data: [], revenue: [], percentages: [] };
        }
        return {
            labels: rows.map(row => row.booking_status),
            data: rows.map(row => row.status_count),
            revenue: rows.map(row => parseFloat(row.status_revenue || 0)),
            percentages: rows.map(row => parseFloat(row.percentage || 0))
        };
    } catch (error) {
        console.error('Error getting booking status:', error);
        return { labels: [], data: [], revenue: [], percentages: [] };
    }
};

export const getTimeSlotPreferences = async () => {
    try {
        const [rows] = await dbClient.execute('SELECT * FROM v_time_slot_preferences');
        if (!rows || rows.length === 0) {
            return { labels: [], data: [], visitors: [], avgAmount: [] };
        }
        return {
            labels: rows.map(row => row.time_slot),
            data: rows.map(row => row.slot_bookings),
            visitors: rows.map(row => row.slot_visitors),
            avgAmount: rows.map(row => parseFloat(row.avg_amount_per_booking || 0))
        };
    } catch (error) {
        console.error('Error getting time slot preferences:', error);
        return { labels: [], data: [], visitors: [], avgAmount: [] };
    }
};

export const getMonthlyTrends = async (months = 12) => {
    try {
        // Use string interpolation instead of parameterized query for LIMIT
        const [rows] = await dbClient.execute(
            `SELECT * FROM v_monthly_trends ORDER BY year DESC, month DESC LIMIT ${parseInt(months)}`
        );

        if (!rows || rows.length === 0) {
            return {
                labels: [],
                bookings: [],
                visitors: [],
                revenue: [],
                avgBookingValue: []
            };
        }

        return {
            labels: rows.map(row => `${row.month_name} ${row.year}`).reverse(),
            bookings: rows.map(row => parseInt(row.monthly_bookings) || 0).reverse(),
            visitors: rows.map(row => parseInt(row.monthly_visitors) || 0).reverse(),
            revenue: rows.map(row => parseFloat(row.monthly_revenue || 0)).reverse(),
            avgBookingValue: rows.map(row => parseFloat(row.avg_booking_value || 0)).reverse()
        };
    } catch (error) {
        console.error('Error getting monthly trends:', error);
        // Return empty data if view doesn't exist or has issues
        return {
            labels: [],
            bookings: [],
            visitors: [],
            revenue: [],
            avgBookingValue: []
        };
    }
};

// =====================================================
// ADVANCED ANALYTICS
// =====================================================

export const getPeakHoursAnalysis = async () => {
    const [rows] = await dbClient.execute('SELECT * FROM v_peak_hours ORDER BY booking_count DESC LIMIT 20');
    return rows;
};

export const getRevenueAnalysis = async () => {
    const [rows] = await dbClient.execute('SELECT * FROM v_revenue_analysis ORDER BY revenue DESC');
    return rows;
};

export const getVisitorDemographics = async (limit = 100) => {
    try {
        // Use direct query since v_visitor_demographics might not exist
        const [rows] = await dbClient.execute(`
            SELECT 
                v.id,
                v.name,
                v.age,
                v.email,
                v.address,
                COUNT(t.booking_id) as total_bookings,
                COALESCE(SUM(t.total_amount), 0) as total_spent,
                MAX(t.safari_date) as last_visit_date,
                MIN(t.safari_date) as first_visit_date
            FROM visitors v
            LEFT JOIN tickets t ON v.id = t.visitor_id
            GROUP BY v.id, v.name, v.age, v.email, v.address
            ORDER BY total_spent DESC
            LIMIT ${parseInt(limit)}
        `);
        return rows || [];
    } catch (error) {
        console.error('Error getting visitor demographics:', error);
        return [];
    }
};

// =====================================================
// FILTERED DATA QUERIES
// =====================================================

export const getFilteredAnalytics = async (filters = {}) => {
    const { startDate, endDate, zone, timeSlot, status } = filters;

    let whereClause = 'WHERE booking_status != "cancelled"';
    const params = [];

    if (startDate) {
        whereClause += ' AND safari_date >= ?';
        params.push(startDate);
    }

    if (endDate) {
        whereClause += ' AND safari_date <= ?';
        params.push(endDate);
    }

    if (zone) {
        whereClause += ' AND safari_zone = ?';
        params.push(zone);
    }

    if (timeSlot) {
        whereClause += ' AND time_slot = ?';
        params.push(timeSlot);
    }

    if (status) {
        whereClause = whereClause.replace('booking_status != "cancelled"', 'booking_status = ?');
        params.push(status);
    }

    // Get filtered statistics
    const statsQuery = `
        SELECT 
            COUNT(*) as total_bookings,
            SUM(person_count) as total_visitors,
            SUM(total_amount) as total_revenue,
            AVG(person_count) as avg_group_size,
            AVG(total_amount) as avg_booking_value
        FROM tickets 
        ${whereClause}
    `;

    const [statsRows] = await dbClient.execute(statsQuery, params);

    // Get filtered zone data
    const zoneQuery = `
        SELECT 
            safari_zone,
            COUNT(*) as booking_count,
            SUM(person_count) as visitor_count,
            SUM(total_amount) as revenue
        FROM tickets 
        ${whereClause}
        GROUP BY safari_zone
        ORDER BY booking_count DESC
    `;

    const [zoneRows] = await dbClient.execute(zoneQuery, params);

    return {
        statistics: statsRows[0],
        zoneData: zoneRows
    };
};

// =====================================================
// REAL-TIME UPDATES
// =====================================================

export const updateAnalyticsSummary = async () => {
    try {
        // Manual update without stored procedure for better compatibility
        const updateQuery = `
            INSERT INTO visitor_analytics_summary (
                summary_date, 
                total_bookings, 
                total_visitors, 
                total_revenue, 
                avg_group_size,
                most_popular_zone,
                most_popular_time_slot
            )
            SELECT 
                CURDATE(),
                COUNT(*),
                COALESCE(SUM(person_count), 0),
                COALESCE(SUM(total_amount), 0),
                COALESCE(AVG(person_count), 0),
                COALESCE((SELECT safari_zone FROM tickets WHERE DATE(safari_date) = CURDATE() AND booking_status != 'cancelled' GROUP BY safari_zone ORDER BY COUNT(*) DESC LIMIT 1), 'Unknown'),
                COALESCE((SELECT time_slot FROM tickets WHERE DATE(safari_date) = CURDATE() AND booking_status != 'cancelled' GROUP BY time_slot ORDER BY COUNT(*) DESC LIMIT 1), 'Unknown')
            FROM tickets 
            WHERE DATE(safari_date) = CURDATE() AND booking_status != 'cancelled'
            ON DUPLICATE KEY UPDATE
                total_bookings = VALUES(total_bookings),
                total_visitors = VALUES(total_visitors),
                total_revenue = VALUES(total_revenue),
                avg_group_size = VALUES(avg_group_size),
                most_popular_zone = VALUES(most_popular_zone),
                most_popular_time_slot = VALUES(most_popular_time_slot),
                updated_at = CURRENT_TIMESTAMP
        `;

        await dbClient.execute(updateQuery);
        return { success: true, message: 'Analytics summary updated successfully' };
    } catch (error) {
        console.error('Error updating analytics summary:', error);
        return { success: false, message: 'Failed to update analytics summary' };
    }
};

export const getLatestSummary = async (days = 7) => {
    const [rows] = await dbClient.execute(
        'SELECT * FROM visitor_analytics_summary WHERE summary_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY summary_date DESC',
        [days]
    );
    return rows;
};

// =====================================================
// PERFORMANCE MONITORING
// =====================================================

export const getQueryPerformanceStats = async () => {
    try {
        // Get index usage statistics
        const [indexStats] = await dbClient.execute(`
            SELECT 
                TABLE_NAME,
                INDEX_NAME,
                CARDINALITY,
                SUB_PART,
                NULLABLE
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME IN ('visitors', 'tickets', 'feedbacks')
            ORDER BY TABLE_NAME, INDEX_NAME
        `);

        return {
            indexStats,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('Error getting performance stats:', error);
        return { error: error.message };
    }
};

// =====================================================
// EXPORT FUNCTIONS FOR BACKWARD COMPATIBILITY
// =====================================================

// These functions maintain compatibility with existing code
export const loadVisitorsInfo = async () => {
    const [rows] = await dbClient.execute('SELECT * FROM visitors ORDER BY id DESC LIMIT 1000');
    return rows;
};

export const loadTicketsInfo = async () => {
    const [rows] = await dbClient.execute(`
        SELECT 
            t.*,
            v.name as visitor_name,
            v.email as visitor_email
        FROM tickets t
        LEFT JOIN visitors v ON t.visitor_id = v.id
        ORDER BY t.safari_date DESC 
        LIMIT 1000
    `);
    return rows;
};

// =====================================================
// COMPREHENSIVE DASHBOARD DATA
// =====================================================

export const getComprehensiveDashboardData = async () => {
    try {
        // Execute all queries in parallel for better performance
        const [
            dashboardStats,
            ageDistribution,
            zonePopularity,
            dailyRevenue,
            bookingStatus,
            timeSlotPreferences,
            monthlyTrends
        ] = await Promise.all([
            getDashboardStats(),
            getAgeDistribution(),
            getZonePopularity(),
            getDailyRevenue(30),
            getBookingStatus(),
            getTimeSlotPreferences(),
            getMonthlyTrends(6)
        ]);

        return {
            statistics: dashboardStats,
            charts: {
                ageDistribution,
                zonePopularity,
                revenueData: dailyRevenue,
                statusData: bookingStatus,
                timeSlotData: timeSlotPreferences,
                visitorTrends: monthlyTrends
            }
        };
    } catch (error) {
        console.error('Error getting comprehensive dashboard data:', error);
        throw error;
    }
};