CREATE TABLE `message_moderationLogs` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`actorUserId` text,
	`durationMs` integer,
	`id` text PRIMARY KEY,
	`roomId` text NOT NULL,
	`targetUserId` text NOT NULL,
	`type` text NOT NULL,
	CONSTRAINT `fk_message_moderationLogs_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_moderationLogs_targetUserId_auth_users_id_fk` FOREIGN KEY (`targetUserId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_moderationNotes` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`actorUserId` text,
	`id` text PRIMARY KEY,
	`note` text NOT NULL,
	`roomId` text NOT NULL,
	`targetUserId` text NOT NULL,
	CONSTRAINT `fk_message_moderationNotes_actorUserId_auth_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_message_moderationNotes_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_moderationNotes_targetUserId_auth_users_id_fk` FOREIGN KEY (`targetUserId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `resource_programParticipants` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`keyValue` text NOT NULL,
	`id` text PRIMARY KEY,
	`publicId` text NOT NULL,
	`resourceId` text NOT NULL,
	`token` text NOT NULL CONSTRAINT `programParticipants_token_unique` UNIQUE,
	CONSTRAINT `fk_resource_programParticipants_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `programParticipants_resourceId_keyValue_unique` UNIQUE(`resourceId`,`keyValue`)
);
--> statement-breakpoint
CREATE TABLE `resource_resourceActivities` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`activityType` text NOT NULL,
	`apiKeyId` text,
	`apiKeyName` text DEFAULT '' NOT NULL,
	`id` text PRIMARY KEY,
	`newName` text,
	`oldName` text,
	`publishVersion` integer,
	`resourceId` text NOT NULL,
	`userId` text,
	CONSTRAINT `fk_resource_resourceActivities_apiKeyId_auth_apiKeys_id_fk` FOREIGN KEY (`apiKeyId`) REFERENCES `auth_apiKeys`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_resource_resourceActivities_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_resource_resourceActivities_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `resource_resourceViews` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`id` text PRIMARY KEY,
	`resourceId` text NOT NULL,
	`utcDate` text NOT NULL,
	CONSTRAINT `fk_resource_resourceViews_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `resourceViews_resourceId_utcDate_unique` UNIQUE(`resourceId`,`utcDate`),
	CONSTRAINT "resourceViews_count_check" CHECK("count" >= 0)
);
--> statement-breakpoint
CREATE TABLE `resource_surveyResponses` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`isDraft` integer DEFAULT false NOT NULL,
	`model` text DEFAULT '{}' NOT NULL,
	`modelVersion` integer DEFAULT 0 NOT NULL,
	`pageNo` integer DEFAULT 0 NOT NULL,
	`participantToken` text DEFAULT '' NOT NULL,
	`resourceId` text NOT NULL,
	CONSTRAINT `fk_resource_surveyResponses_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `moderationLogs_roomId_createdAt_id_index` ON `message_moderationLogs` (`roomId`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `moderationLogs_actorUserId_index` ON `message_moderationLogs` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `moderationLogs_targetUserId_index` ON `message_moderationLogs` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `moderationNotes_roomId_targetUserId_createdAt_id_index` ON `message_moderationNotes` (`roomId`,`targetUserId`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `moderationNotes_actorUserId_index` ON `message_moderationNotes` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `moderationNotes_targetUserId_index` ON `message_moderationNotes` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `resourceActivities_resourceId_createdAt_id_index` ON `resource_resourceActivities` (`resourceId`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `resourceActivities_apiKeyId_index` ON `resource_resourceActivities` (`apiKeyId`);--> statement-breakpoint
CREATE INDEX `resourceActivities_userId_index` ON `resource_resourceActivities` (`userId`);--> statement-breakpoint
CREATE INDEX `surveyResponses_resourceId_isDraft_createdAt_id_index` ON `resource_surveyResponses` (`resourceId`,`isDraft`,`createdAt`,`id`);