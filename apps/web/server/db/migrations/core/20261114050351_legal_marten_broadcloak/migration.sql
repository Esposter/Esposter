CREATE TABLE `resource_resourceObjectLocks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`holder` text NOT NULL,
	`resourceId` text PRIMARY KEY,
	CONSTRAINT `fk_resource_resourceObjectLocks_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE
);
