ALTER TABLE `messageEmojis` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `onlineMembers` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `roomState` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduledMessages` ADD `version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `unindexedMessages` ADD `version` integer DEFAULT 0 NOT NULL;