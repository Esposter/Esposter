CREATE TABLE `unindexedMessages` (
	`createdAt` integer NOT NULL,
	`messageId` integer PRIMARY KEY,
	`retryAt` integer NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `messages` ADD `editedAt` integer;--> statement-breakpoint
CREATE INDEX `messagesPinnedIdIndex` ON `messages` (`id`) WHERE "messages"."deletedAt" IS NULL AND "messages"."isPinned" = 1;--> statement-breakpoint
UPDATE `messages` SET `editedAt` = `updatedAt` WHERE `isEdited` = 1;--> statement-breakpoint
ALTER TABLE `messages` DROP COLUMN `isEdited`;--> statement-breakpoint
ALTER TABLE `roomState` DROP COLUMN `lastMessageAt`;