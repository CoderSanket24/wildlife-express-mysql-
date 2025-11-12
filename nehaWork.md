# procedure to add animal to database
DELIMITER //

CREATE PROCEDURE sp_LogAnimalSurvey (
    IN p_species_id VARCHAR(255),
    IN p_name VARCHAR(255),
    IN p_status VARCHAR(255),
    IN p_count INT,
    IN p_habitat_zone VARCHAR(255),
    IN p_last_survey DATE,
    IN p_image_url VARCHAR(255)
)
BEGIN
    INSERT INTO animals (
        species_id, name, status, count, habitat_zone, last_survey, image_url
    )
    VALUES (
        p_species_id, p_name, p_status, p_count, p_habitat_zone, p_last_survey, p_image_url
    )
    ON DUPLICATE KEY UPDATE -- This is the magic!
        count = p_count,
        last_survey = p_last_survey,
        status = p_status,
        image_url = p_image_url;
END //

DELIMITER ;