DROP INDEX IF EXISTS `searchHistories_userId_roomId_index`;--> statement-breakpoint
CREATE INDEX `searchHistories_userId_roomId_id_index` ON `message_searchHistories` (`userId`,`roomId`,`id`);