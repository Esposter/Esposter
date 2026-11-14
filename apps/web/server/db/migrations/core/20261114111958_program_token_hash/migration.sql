ALTER TABLE `resource_surveyResponses` ADD `participantTokenHash` text DEFAULT '' NOT NULL;--> statement-breakpoint
-- A credential cannot be hashed in SQL, and the plain one is dropped by these rebuilds. So each existing participant takes a value
-- no SHA-256 digest equals, and each response that answered under a token keeps its participant by that same value. The links
-- already sent stop working until the owner issues new ones, and the answers stay on their participants
UPDATE `resource_surveyResponses` SET `participantTokenHash` = COALESCE((SELECT 'revoked-' || `resource_programParticipants`.`id` FROM `resource_programParticipants` WHERE `resource_programParticipants`.`token` = `resource_surveyResponses`.`participantToken`), 'revoked-' || `resource_surveyResponses`.`id`) WHERE `participantToken` <> '';--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_resource_programParticipants` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`keyValue` text NOT NULL,
	`id` text PRIMARY KEY,
	`publicId` text NOT NULL,
	`resourceId` text NOT NULL,
	`tokenHash` text NOT NULL CONSTRAINT `programParticipants_tokenHash_unique` UNIQUE,
	CONSTRAINT `fk_resource_programParticipants_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `programParticipants_resourceId_keyValue_unique` UNIQUE(`resourceId`,`keyValue`)
);
--> statement-breakpoint
INSERT INTO `__new_resource_programParticipants`(`createdAt`, `deletedAt`, `updatedAt`, `keyValue`, `id`, `publicId`, `resourceId`, `tokenHash`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `keyValue`, `id`, `publicId`, `resourceId`, 'revoked-' || `id` FROM `resource_programParticipants`;--> statement-breakpoint
DROP TABLE `resource_programParticipants`;--> statement-breakpoint
ALTER TABLE `__new_resource_programParticipants` RENAME TO `resource_programParticipants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `resource_surveyResponses` DROP COLUMN `participantToken`;