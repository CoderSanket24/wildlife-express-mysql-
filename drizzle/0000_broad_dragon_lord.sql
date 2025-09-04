CREATE TABLE `visitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`aadhar_id` varchar(15) NOT NULL,
	`email` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`gender` varchar(10) NOT NULL,
	`phone` varchar(11) NOT NULL,
	`address` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`pin` varchar(7) NOT NULL,
	`interests` varchar(25) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `visitors_id` PRIMARY KEY(`id`),
	CONSTRAINT `visitors_aadhar_id_unique` UNIQUE(`aadhar_id`),
	CONSTRAINT `visitors_email_unique` UNIQUE(`email`)
);
