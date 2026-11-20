DROP INDEX `roomEmojis_roomId_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `roomEmojis_roomId_name_unique` ON `message_roomEmojis` (`roomId`,`name`) WHERE "message_roomEmojis"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX `appUsers_deletedAt_index` ON `message_appUsers` (`deletedAt`) WHERE "message_appUsers"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `invites_deletedAt_index` ON `message_invites` (`deletedAt`) WHERE "message_invites"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `roomEmojis_deletedAt_index` ON `message_roomEmojis` (`deletedAt`) WHERE "message_roomEmojis"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `webhooks_deletedAt_index` ON `message_webhooks` (`deletedAt`) WHERE "message_webhooks"."deletedAt" IS NOT NULL;
