CREATE TABLE `zones` (
	`zone_id` varchar(2) NOT NULL,
	`zone_name` varchar(255) NOT NULL,
	`area` float NOT NULL,
	`climate` varchar(30) NOT NULL,
	`camera_traps` int NOT NULL,
	`access_level` varchar(30) NOT NULL,
	`primary_species` varchar(200) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zones_zone_id` PRIMARY KEY(`zone_id`),
	CONSTRAINT `zones_zone_name_unique` UNIQUE(`zone_name`)
);
