ALTER TABLE `remindersInUser` ADD `deletedAt` integer;--> statement-breakpoint
ALTER TABLE `scheduledMessagesInUser` ADD `deletedAt` integer;--> statement-breakpoint
CREATE INDEX `remindersInUser_deletedAt_index` ON `remindersInUser` (`deletedAt`) WHERE "remindersInUser"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `scheduledMessagesInUser_deletedAt_index` ON `scheduledMessagesInUser` (`deletedAt`) WHERE "scheduledMessagesInUser"."deletedAt" IS NOT NULL;