CREATE TABLE `scheduledMessagesInUser` (
	`roomId` text NOT NULL,
	`runAt` integer NOT NULL,
	`scheduledId` text PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE `sentMessagesInUser` (
	`createdAt` integer NOT NULL,
	`messageId` integer NOT NULL,
	`roomId` text NOT NULL,
	CONSTRAINT `sentMessagesInUser_pk` PRIMARY KEY(`roomId`, `messageId`)
);
--> statement-breakpoint
CREATE TABLE `todoRemindersInUser` (
	`dueAt` integer NOT NULL,
	`itemId` text NOT NULL,
	`resourceId` text NOT NULL,
	CONSTRAINT `todoRemindersInUser_pk` PRIMARY KEY(`resourceId`, `itemId`)
);
--> statement-breakpoint
CREATE INDEX `scheduledMessagesInUserRunAtIndex` ON `scheduledMessagesInUser` (`runAt`,`roomId`);--> statement-breakpoint
CREATE INDEX `sentMessagesInUserCreatedAtIndex` ON `sentMessagesInUser` (`createdAt`,`roomId`,`messageId`);--> statement-breakpoint
CREATE INDEX `todoRemindersInUserDueAtIndex` ON `todoRemindersInUser` (`dueAt`);