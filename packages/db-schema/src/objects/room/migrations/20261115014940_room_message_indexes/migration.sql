CREATE INDEX `messagesReplyToIdIndex` ON `messages` (`replyToId`,`id`);--> statement-breakpoint
CREATE INDEX `messagesUserIdIndex` ON `messages` (`userId`,`id`);