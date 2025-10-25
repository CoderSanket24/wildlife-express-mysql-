-- Get all tickets booked by a specific visitor along with their name and email
SELECT
    v.name,
    v.email,
    t.booking_id,
    t.safari_date,
    t.time_slot,
    t.safari_zone,
    t.person_count,
    t.total_amount
FROM visitors v
JOIN tickets t ON v.id = t.visitor_id
WHERE v.email = '${email}';

# trigger for ticket
DELIMITER $$

CREATE TRIGGER before_ticket_insert_calculate_cost
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
    DECLARE v_services_cost DECIMAL(10,2);
    DECLARE v_gst_rate DECIMAL(5,2) DEFAULT 0.18; -- 18% GST
    DECLARE v_guide_cost DECIMAL(10,2) DEFAULT 500.00;
    DECLARE v_camera_cost DECIMAL(10,2) DEFAULT 250.00;
    DECLARE v_lunch_cost DECIMAL(10,2) DEFAULT 300.00;
    DECLARE v_transport_cost DECIMAL(10,2) DEFAULT 1000.00;

    -- cost of additional services
    SET v_services_cost = 0;
    IF NEW.has_guide = 1 THEN SET v_services_cost = v_services_cost + v_guide_cost; END IF;
    IF NEW.has_camera = 1 THEN SET v_services_cost = v_services_cost + v_camera_cost; END IF;
    IF NEW.has_lunch = 1 THEN SET v_services_cost = v_services_cost + (v_lunch_cost * NEW.person_count); END IF;
    IF NEW.has_transport = 1 THEN SET v_services_cost = v_services_cost + v_transport_cost; END IF;

    SET NEW.services_cost = v_services_cost;
    SET NEW.gst_amount = (NEW.base_cost + v_services_cost) * v_gst_rate;
    SET NEW.total_amount = NEW.base_cost + v_services_cost + NEW.gst_amount;
END$$

DELIMITER ;



# procedure
DELIMITER $$

CREATE PROCEDURE BookSafariTicket(
    IN p_visitor_email VARCHAR(255),
    IN p_safari_date DATE,
    IN p_time_slot VARCHAR(20),
    IN p_safari_zone VARCHAR(20),
    IN p_person_count TINYINT,
    IN p_base_cost DECIMAL(10,2), 
    IN p_has_guide BOOLEAN,
    IN p_has_camera BOOLEAN,
    IN p_has_lunch BOOLEAN,
    IN p_has_transport BOOLEAN,

    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_visitor_id INT;
    DECLARE v_booking_id VARCHAR(25);
    DECLARE v_existing_booking_count INT DEFAULT 0;
    -- REMOVED: The hardcoded DECLARE v_base_cost line is gone.

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_message = 'Error: Booking failed due to a database error. Transaction rolled back.';
    END;

    SELECT id INTO v_visitor_id FROM visitors WHERE email = p_visitor_email;

    IF v_visitor_id IS NULL THEN
        SET p_message = 'Error: Visitor not found. Please register first.';
    ELSE
        SELECT COUNT(*) INTO v_existing_booking_count FROM tickets
        WHERE visitor_id = v_visitor_id
          AND safari_date = p_safari_date
          AND time_slot = p_time_slot
          AND booking_status = 'confirmed';

        IF v_existing_booking_count > 0 THEN
            SET p_message = 'Error: You already have a confirmed booking for this date and time slot.';
        ELSE
            SET v_booking_id = CONCAT('BK', UNIX_TIMESTAMP(), v_visitor_id);

            START TRANSACTION;

            INSERT INTO tickets (
                booking_id, visitor_id, safari_date, time_slot, safari_zone,
                person_count, base_cost, has_guide, has_camera, has_lunch, has_transport
            )
            VALUES (
                v_booking_id, v_visitor_id, p_safari_date, p_time_slot, p_safari_zone,
                p_person_count, p_base_cost, -- CHANGED: Using the input parameter here
                p_has_guide, p_has_camera, p_has_lunch, p_has_transport
            );

            COMMIT;
            SET p_message = CONCAT('Success! Your booking ID is ', v_booking_id);
        END IF;
    END IF;
END$$

DELIMITER ;


# trigger for feedbacks
DELIMITER //

CREATE TRIGGER trg_Feedback_BeforeInsert
BEFORE INSERT ON feedbacks
FOR EACH ROW
BEGIN
    -- Check rating range
    IF NEW.rating_overall < 1 OR NEW.rating_overall > 5 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Overall rating must be between 1 and 5.';
    END IF;

    -- Enforce comments for bad reviews
    IF NEW.rating_overall <= 2 AND (NEW.comments IS NULL OR NEW.comments = '') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Comments are required for ratings of 1 or 2.';
    END IF;
END //

DELIMITTER ;


# inner join on feedback and visitor
SELECT
    v.name,
    f.visit_date,
    f.booking_id,
    f.rating_overall,
    f.rating_guide,
    f.rating_facility,
    f.sightings,
    f.comments,
    f.recommend,
    f.submitted_at
FROM feedbacks f
INNER JOIN visitors v ON f.visitor_id = v.id
ORDER BY submitted_at DESC;