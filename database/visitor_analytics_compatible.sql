-- =====================================================
-- VISITOR ANALYTICS DASHBOARD - FULLY COMPATIBLE VERSION
-- Compatible with MySQL 5.7+ with strict mode
-- =====================================================

-- Create indexes (without IF NOT EXISTS for compatibility)
-- =====================================================

-- Drop existing indexes if they exist (ignore errors)
-- ALTER TABLE tickets DROP INDEX idx_tickets_safari_date;
-- ALTER TABLE tickets DROP INDEX idx_tickets_booking_status;
-- ALTER TABLE tickets DROP INDEX idx_tickets_safari_zone;
-- ALTER TABLE tickets DROP INDEX idx_tickets_time_slot;
-- ALTER TABLE tickets DROP INDEX idx_tickets_visitor_id;
-- ALTER TABLE visitors DROP INDEX idx_visitors_age;
-- ALTER TABLE visitors DROP INDEX idx_visitors_email;
-- ALTER TABLE tickets DROP INDEX idx_tickets_date_status;
-- ALTER TABLE tickets DROP INDEX idx_tickets_zone_date;

-- Create indexes (will fail silently if they exist)
CREATE INDEX idx_tickets_safari_date ON tickets(safari_date);
CREATE INDEX idx_tickets_booking_status ON tickets(booking_status);
CREATE INDEX idx_tickets_safari_zone ON tickets(safari_zone);
CREATE INDEX idx_tickets_time_slot ON tickets(time_slot);
CREATE INDEX idx_tickets_visitor_id ON tickets(visitor_id);
CREATE INDEX idx_visitors_age ON visitors(age);
CREATE INDEX idx_visitors_email ON visitors(email);
CREATE INDEX idx_tickets_date_status ON tickets(safari_date, booking_status);
CREATE INDEX idx_tickets_zone_date ON tickets(safari_zone, safari_date);

-- =====================================================
-- DATABASE VIEWS FOR VISITOR ANALYTICS
-- =====================================================

-- 1. Age Distribution View (Fixed GROUP BY)
DROP VIEW IF EXISTS v_age_distribution;
CREATE VIEW v_age_distribution AS
SELECT 
    age_group,
    COUNT(*) as visitor_count
FROM (
    SELECT 
        CASE 
            WHEN age <= 18 THEN '0-18'
            WHEN age <= 35 THEN '19-35'
            WHEN age <= 50 THEN '36-50'
            WHEN age <= 65 THEN '51-65'
            ELSE '65+'
        END AS age_group
    FROM visitors
) AS age_groups
GROUP BY age_group
ORDER BY 
    CASE age_group
        WHEN '0-18' THEN 1
        WHEN '19-35' THEN 2
        WHEN '36-50' THEN 3
        WHEN '51-65' THEN 4
        ELSE 5
    END;

-- 2. Safari Zone Popularity View
DROP VIEW IF EXISTS v_zone_popularity;
CREATE VIEW v_zone_popularity AS
SELECT 
    safari_zone,
    COUNT(*) as booking_count,
    SUM(person_count) as total_visitors,
    SUM(total_amount) as total_revenue
FROM tickets 
WHERE booking_status != 'cancelled'
GROUP BY safari_zone
ORDER BY booking_count DESC;

-- 3. Daily Revenue Trends View
DROP VIEW IF EXISTS v_daily_revenue;
CREATE VIEW v_daily_revenue AS
SELECT 
    DATE(safari_date) as date,
    COUNT(*) as booking_count,
    SUM(person_count) as daily_visitors,
    SUM(total_amount) as daily_revenue
FROM tickets 
WHERE booking_status != 'cancelled'
GROUP BY DATE(safari_date)
ORDER BY DATE(safari_date) DESC;

-- 4. Booking Status Overview View
DROP VIEW IF EXISTS v_booking_status;
CREATE VIEW v_booking_status AS
SELECT 
    booking_status,
    COUNT(*) as status_count,
    SUM(total_amount) as status_revenue,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tickets)), 2) as percentage
FROM tickets 
GROUP BY booking_status;

-- 5. Time Slot Preferences View
DROP VIEW IF EXISTS v_time_slot_preferences;
CREATE VIEW v_time_slot_preferences AS
SELECT 
    time_slot,
    COUNT(*) as slot_bookings,
    SUM(person_count) as slot_visitors,
    AVG(total_amount) as avg_amount_per_booking
FROM tickets 
WHERE booking_status != 'cancelled'
GROUP BY time_slot
ORDER BY slot_bookings DESC;

-- 6. Monthly Visitor Trends View (Fixed GROUP BY)
DROP VIEW IF EXISTS v_monthly_trends;
CREATE VIEW v_monthly_trends AS
SELECT 
    year_month.year,
    year_month.month,
    year_month.month_name,
    COUNT(*) as monthly_bookings,
    SUM(person_count) as monthly_visitors,
    SUM(total_amount) as monthly_revenue,
    AVG(total_amount) as avg_booking_value
FROM (
    SELECT 
        YEAR(safari_date) as year,
        MONTH(safari_date) as month,
        MONTHNAME(safari_date) as month_name,
        person_count,
        total_amount
    FROM tickets 
    WHERE booking_status != 'cancelled'
) AS year_month
GROUP BY year_month.year, year_month.month, year_month.month_name
ORDER BY year_month.year DESC, year_month.month DESC;

-- 7. Dashboard Statistics View
DROP VIEW IF EXISTS v_dashboard_stats;
CREATE VIEW v_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM tickets WHERE DATE(safari_date) = CURDATE() AND booking_status != 'cancelled') as today_bookings,
    (SELECT COALESCE(SUM(person_count), 0) FROM tickets WHERE DATE(safari_date) = CURDATE() AND booking_status != 'cancelled') as today_visitors,
    (SELECT COALESCE(SUM(total_amount), 0) FROM tickets WHERE DATE(safari_date) = CURDATE() AND booking_status != 'cancelled') as today_revenue,
    (SELECT COUNT(*) FROM tickets WHERE YEAR(safari_date) = YEAR(CURDATE()) AND MONTH(safari_date) = MONTH(CURDATE()) AND booking_status != 'cancelled') as month_bookings,
    (SELECT COALESCE(SUM(person_count), 0) FROM tickets WHERE YEAR(safari_date) = YEAR(CURDATE()) AND MONTH(safari_date) = MONTH(CURDATE()) AND booking_status != 'cancelled') as month_visitors,
    (SELECT COALESCE(SUM(total_amount), 0) FROM tickets WHERE YEAR(safari_date) = YEAR(CURDATE()) AND MONTH(safari_date) = MONTH(CURDATE()) AND booking_status != 'cancelled') as month_revenue,
    (SELECT COUNT(*) FROM tickets WHERE booking_status != 'cancelled') as total_bookings,
    (SELECT COALESCE(SUM(person_count), 0) FROM tickets WHERE booking_status != 'cancelled') as total_visitors,
    (SELECT COALESCE(SUM(total_amount), 0) FROM tickets WHERE booking_status != 'cancelled') as total_revenue,
    (SELECT COUNT(*) FROM visitors) as registered_visitors;

-- 8. Summary Table for Caching
CREATE TABLE IF NOT EXISTS visitor_analytics_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    summary_date DATE NOT NULL,
    total_bookings INT DEFAULT 0,
    total_visitors INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    avg_group_size DECIMAL(5,2) DEFAULT 0,
    most_popular_zone VARCHAR(100),
    most_popular_time_slot VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (summary_date)
);

-- Create index on summary table (without IF NOT EXISTS)
CREATE INDEX idx_summary_date ON visitor_analytics_summary(summary_date);

-- Analyze tables for optimization
ANALYZE TABLE visitors, tickets, feedbacks, zones;