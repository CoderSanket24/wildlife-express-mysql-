# aggregate function
SELECT
    SUM(area) AS total_area,
    SUM(camera_traps) AS total_cameras
FROM zones;

# prodedure
DELIMITER //

CREATE PROCEDURE sp_AddZone_V2 (
    IN p_zone_id VARCHAR(2),
    IN p_zone_name VARCHAR(255),
    IN p_area DECIMAL(10, 2),
    IN p_climate VARCHAR(30),
    IN p_camera_traps INT,
    IN p_access_level VARCHAR(30),
    IN p_primary_species VARCHAR(200),
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Declare a handler that will run if any SQL error (SQLEXCEPTION) occurs.
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
	
        ROLLBACK;
	
        SET p_message = 'Failed to add zone. An error occurred (e.g., duplicate name/ID).';
    END;

    -- Start a transaction block.
    START TRANSACTION;

        -- Perform the insertion.
        INSERT INTO zones (
            zone_id, zone_name, area, climate, camera_traps,
            access_level, primary_species
        )
        VALUES (
            p_zone_id, p_zone_name, p_area, p_climate, p_camera_traps,
            p_access_level, p_primary_species
        );

        -- If the INSERT was successful, set the success message.
        SET p_message = CONCAT('Successfully added zone: ', p_zone_name);

    -- If no errors occurred, commit the transaction to make the changes permanent.
    COMMIT;

END //

DELIMITER ;

# view
CREATE VIEW v_zones_enhanced AS
SELECT 
    z.zone_id,
    z.zone_name,
    z.area,
    z.climate,
    z.camera_traps,
    z.access_level,
    z.primary_species,
    -- Calculate camera density per square kilometer
    ROUND(z.camera_traps / z.area, 2) as camera_density,
    -- Count total bookings for this zone
    COALESCE(booking_stats.total_bookings, 0) as total_bookings,
    -- Count total visitors for this zone
    COALESCE(booking_stats.total_visitors, 0) as total_visitors,
    -- Calculate total revenue from this zone
    COALESCE(booking_stats.total_revenue, 0) as total_revenue,
    -- Get most recent booking date
    booking_stats.last_booking_date,
    -- Count animals in this zone
    COALESCE(animal_stats.animal_count, 0) as animal_count,
    -- Count species in this zone
    COALESCE(animal_stats.species_count, 0) as species_count
FROM zones z
LEFT JOIN (
    SELECT 
        safari_zone,
        COUNT(*) as total_bookings,
        SUM(person_count) as total_visitors,
        SUM(total_amount) as total_revenue,
        MAX(safari_date) as last_booking_date
    FROM tickets
    WHERE booking_status != 'cancelled'
    GROUP BY safari_zone
) booking_stats ON z.zone_id = booking_stats.safari_zone
LEFT JOIN (
    SELECT 
        habitat_zone,
        COUNT(*) as animal_count,
        COUNT(DISTINCT species_id) as species_count
    FROM animals
    GROUP BY habitat_zone
) animal_stats ON z.zone_id = animal_stats.habitat_zone;
