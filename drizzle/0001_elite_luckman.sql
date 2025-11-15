CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`alertType` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `machines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`description` text,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `machines_id` PRIMARY KEY(`id`),
	CONSTRAINT `machines_machineId_unique` UNIQUE(`machineId`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`maintenanceHistoryId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`maintenanceDate` timestamp NOT NULL,
	`maintenanceType` varchar(100) NOT NULL,
	`notes` text,
	`technicianName` varchar(255),
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`intervalDays` int NOT NULL,
	`lastMaintenanceDate` timestamp,
	`nextMaintenanceDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_schedules_id` PRIMARY KEY(`id`)
);
