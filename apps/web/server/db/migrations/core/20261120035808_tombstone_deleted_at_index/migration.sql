CREATE INDEX `bookmarks_deletedAt_index` ON `app_bookmarks` (`deletedAt`) WHERE "app_bookmarks"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `bans_deletedAt_index` ON `message_bans` (`deletedAt`) WHERE "message_bans"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `notifications_deletedAt_index` ON `notification_notifications` (`deletedAt`) WHERE "notification_notifications"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `resourceFavorites_deletedAt_index` ON `resource_resourceFavorites` (`deletedAt`) WHERE "resource_resourceFavorites"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `resourcePublications_deletedAt_index` ON `resource_resourcePublications` (`deletedAt`) WHERE "resource_resourcePublications"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `blocks_deletedAt_index` ON `social_blocks` (`deletedAt`) WHERE "social_blocks"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `friendRequests_deletedAt_index` ON `social_friendRequests` (`deletedAt`) WHERE "social_friendRequests"."deletedAt" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `friends_deletedAt_index` ON `social_friends` (`deletedAt`) WHERE "social_friends"."deletedAt" IS NOT NULL;