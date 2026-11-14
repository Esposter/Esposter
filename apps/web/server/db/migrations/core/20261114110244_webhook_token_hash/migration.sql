PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_webhooks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`creatorId` text NOT NULL,
	`id` text PRIMARY KEY,
	`isActive` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`roomId` text NOT NULL,
	`tokenHash` text NOT NULL CONSTRAINT `webhooks_tokenHash_unique` UNIQUE,
	`userId` text NOT NULL UNIQUE,
	CONSTRAINT `fk_message_webhooks_creatorId_auth_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_webhooks_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_webhooks_userId_message_appUsers_id_fk` FOREIGN KEY (`userId`) REFERENCES `message_appUsers`(`id`) ON DELETE CASCADE,
	CONSTRAINT "webhooks_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
-- A credential cannot be hashed in SQL, and the plain one is dropped by this rebuild, so each existing webhook takes a
-- value no SHA-256 digest equals: its URL answers as unknown until its owner regenerates it
INSERT INTO `__new_message_webhooks`(`createdAt`, `deletedAt`, `updatedAt`, `creatorId`, `id`, `isActive`, `name`, `roomId`, `tokenHash`, `userId`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `creatorId`, `id`, `isActive`, `name`, `roomId`, 'revoked-' || `id`, `userId` FROM `message_webhooks`;--> statement-breakpoint
DROP TABLE `message_webhooks`;--> statement-breakpoint
ALTER TABLE `__new_message_webhooks` RENAME TO `message_webhooks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `webhooks_roomId_index` ON `message_webhooks` (`roomId`);