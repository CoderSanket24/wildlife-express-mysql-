# procedure to add data in table
DELIMITER //

CREATE PROCEDURE sp_HireRanger (
    IN p_employee_id INT,
    IN p_employee_name VARCHAR(50),
    IN p_age INT,
    IN p_gender VARCHAR(10),
    IN p_assigned_zone VARCHAR(2), -- Changed to match zone_id
    IN p_experience_years INT,
    IN p_shift VARCHAR(20),
    IN p_role VARCHAR(50),
    IN p_category VARCHAR(30),
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Error handler for duplicate employee_id
    DECLARE EXIT HANDLER FOR 1062 -- 1062 is the error code for duplicate primary key
    BEGIN
        SET p_message = 'Failed to hire: Employee ID already exists.';
        ROLLBACK;
    END;
    
    -- Error handler for foreign key violation
    DECLARE EXIT HANDLER FOR 1452 -- 1452 is for foreign key errors
    BEGIN
        SET p_message = 'Failed to hire: Assigned zone does not exist.';
        ROLLBACK;
    END;

    START TRANSACTION;
        INSERT INTO rangers_staff (
            employee_id, employee_name, age, gender, assigned_zone,
            experience_years, shift, role, category
        ) VALUES (
            p_employee_id, p_employee_name, p_age, p_gender, p_assigned_zone,
            p_experience_years, p_shift, p_role, p_category
        );
        SET p_message = 'Ranger hired successfully.';
    COMMIT;
END //

DELIMITER ;

# trigger before insert
DELIMITER //

CREATE TRIGGER trg_staff_before_insert
BEFORE INSERT ON rangers_staff
FOR EACH ROW
BEGIN
    -- Check Age
    IF NEW.age <= 18 THEN
        SIGNAL SQLSTATE '45000' -- '45000' is a generic error state
        SET MESSAGE_TEXT = 'Cannot add ranger: Age must be greater than 18.';
    END IF;

    -- Check Experience
    IF NEW.experience_years < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot add ranger: Experience years cannot be negative.';
    END IF;

    -- Check Gender
    IF NEW.gender NOT IN ('Male', 'Female', 'Other') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot add ranger: Gender must be ''Male'', ''Female'', or ''Other''.';
    END IF;
END //

DELIMITER ;

# trigger before update
CREATE TRIGGER trg_staff_before_update
BEFORE UPDATE ON rangers_staff
FOR EACH ROW
BEGIN
    -- Check Age
    IF NEW.age <= 18 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot update ranger: Age must be greater than 18.';
    END IF;

    -- Check Experience
    IF NEW.experience_years < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot update ranger: Experience years cannot be negative.';
    END IF;

    -- Check Gender
    IF NEW.gender NOT IN ('Male', 'Female', 'Other') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot update ranger: Gender must be ''Male'', ''Female'', or ''Other''.';
    END IF;
END //

DELIMITER ;