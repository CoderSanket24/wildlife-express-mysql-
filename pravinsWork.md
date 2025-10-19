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