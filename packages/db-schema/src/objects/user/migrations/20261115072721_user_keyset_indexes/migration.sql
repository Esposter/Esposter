DROP INDEX IF EXISTS `remindersInUserRunAtIndex`;--> statement-breakpoint
DROP INDEX IF EXISTS `scheduledMessagesInUserRunAtIndex`;--> statement-breakpoint
CREATE INDEX `remindersInUserRunAtIdIndex` ON `remindersInUser` (`runAt`,`id`);--> statement-breakpoint
CREATE INDEX `scheduledMessagesInUserRunAtScheduledIdIndex` ON `scheduledMessagesInUser` (`runAt`,`scheduledId`);