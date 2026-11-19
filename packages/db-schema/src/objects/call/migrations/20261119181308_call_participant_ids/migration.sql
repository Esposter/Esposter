ALTER TABLE `realtimeKitParticipants` RENAME COLUMN `sessionId` TO `participantId`;--> statement-breakpoint
ALTER TABLE `knockers` ADD `sessionId` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `knockers` SET `sessionId` = `id`;--> statement-breakpoint
ALTER TABLE `participants` ADD `sessionId` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `participants` SET `sessionId` = `id`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_knockers` (
	`id` text PRIMARY KEY,
	`sessionId` text NOT NULL UNIQUE,
	`image` text DEFAULT '' NOT NULL,
	`isCameraEnabled` integer NOT NULL,
	`isHandRaised` integer NOT NULL,
	`isMuted` integer NOT NULL,
	`name` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_knockers`(`id`, `sessionId`, `image`, `isCameraEnabled`, `isHandRaised`, `isMuted`, `name`, `userId`) SELECT `id`, `sessionId`, `image`, `isCameraEnabled`, `isHandRaised`, `isMuted`, `name`, `userId` FROM `knockers`;--> statement-breakpoint
DROP TABLE `knockers`;--> statement-breakpoint
ALTER TABLE `__new_knockers` RENAME TO `knockers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_participants` (
	`id` text PRIMARY KEY,
	`sessionId` text NOT NULL UNIQUE,
	`image` text DEFAULT '' NOT NULL,
	`isCameraEnabled` integer NOT NULL,
	`isHandRaised` integer NOT NULL,
	`isMuted` integer NOT NULL,
	`name` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_participants`(`id`, `sessionId`, `image`, `isCameraEnabled`, `isHandRaised`, `isMuted`, `name`, `userId`) SELECT `id`, `sessionId`, `image`, `isCameraEnabled`, `isHandRaised`, `isMuted`, `name`, `userId` FROM `participants`;--> statement-breakpoint
DROP TABLE `participants`;--> statement-breakpoint
ALTER TABLE `__new_participants` RENAME TO `participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
