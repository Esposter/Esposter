DROP INDEX IF EXISTS `moderationLogs_roomId_createdAt_id_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `moderationNotes_roomId_targetUserId_createdAt_id_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `surveyResponses_resourceId_isDraft_createdAt_id_index`;--> statement-breakpoint
CREATE INDEX `moderationLogs_roomId_id_index` ON `message_moderationLogs` (`roomId`,`id`);--> statement-breakpoint
CREATE INDEX `moderationNotes_roomId_targetUserId_id_index` ON `message_moderationNotes` (`roomId`,`targetUserId`,`id`);--> statement-breakpoint
CREATE INDEX `notifications_userId_id_index` ON `notification_notifications` (`userId`,"id" DESC);--> statement-breakpoint
CREATE INDEX `resourceActivities_resourceId_id_index` ON `resource_resourceActivities` (`resourceId`,`id`);--> statement-breakpoint
CREATE INDEX `surveyResponses_resourceId_isDraft_id_index` ON `resource_surveyResponses` (`resourceId`,`isDraft`,`id`);