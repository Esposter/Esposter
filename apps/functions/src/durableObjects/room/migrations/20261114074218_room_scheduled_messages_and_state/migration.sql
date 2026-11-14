CREATE TABLE `roomState` (
	`bumpDueAt` integer,
	`id` integer PRIMARY KEY,
	`lastMessageAt` integer
);
--> statement-breakpoint
CREATE TABLE `scheduledMessages` (
	`id` text PRIMARY KEY,
	`message` text NOT NULL,
	`replyToId` integer,
	`runAt` integer NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `scheduledMessagesRunAtIndex` ON `scheduledMessages` (`runAt`);