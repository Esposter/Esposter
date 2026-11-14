DROP INDEX IF EXISTS `messages_roomId_createdAt_id_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `messages_replyToId_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `messages_roomId_userId_index`;--> statement-breakpoint
DROP TABLE `message_messageEmojis`;--> statement-breakpoint
DROP TABLE `message_messages`;--> statement-breakpoint
DROP TABLE `messages_search`;