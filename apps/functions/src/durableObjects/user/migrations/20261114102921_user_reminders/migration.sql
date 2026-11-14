CREATE TABLE `remindersInUser` (
	`id` text PRIMARY KEY,
	`roomId` text NOT NULL,
	`runAt` integer NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `remindersInUserRunAtIndex` ON `remindersInUser` (`runAt`);