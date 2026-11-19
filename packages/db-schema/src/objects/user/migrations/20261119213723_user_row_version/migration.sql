ALTER TABLE `joinedCallsInUser` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `remindersInUser` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduledMessagesInUser` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sentMessagesInUser` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `todoRemindersInUser` ADD `version` integer DEFAULT 0 NOT NULL;