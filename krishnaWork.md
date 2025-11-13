# procedure to add medical checkup data

DELIMITER //

CREATE PROCEDURE sp_AddCheckup (
    IN p_animal_id INT,
    IN p_checkup_date DATE,
    IN p_health_status VARCHAR(255),
    IN p_weight_kg DECIMAL(10, 2),
    IN p_vaccination_status VARCHAR(255),
    IN p_next_checkup_date DATE,
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Error handler for foreign key violation
    -- (e.g., trying to add a checkup for an animal_id that doesn't exist)
    DECLARE EXIT HANDLER FOR 1452 
    BEGIN
        SET p_message = 'Failed to add checkup: Animal ID does not exist.';
        ROLLBACK;
    END;

    -- General error handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_message = 'An unknown error occurred.';
        ROLLBACK;
    END;

    -- Start transaction
    START TRANSACTION;
        
        INSERT INTO medical_checkups (
            animal_id,
            checkup_date,
            health_status,
            weight_kg,
            vaccination_status,
            next_checkup_date
        )
        VALUES (
            p_animal_id,
            p_checkup_date,
            p_health_status,
            p_weight_kg,
            p_vaccination_status,
            p_next_checkup_date
        );
        
        SET p_message = 'Medical checkup added successfully.';

    COMMIT;

END //

DELIMITER ;