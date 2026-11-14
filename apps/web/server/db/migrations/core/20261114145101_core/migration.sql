CREATE TABLE `achievement_achievements` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `achievement_userAchievements` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`achievementId` text NOT NULL,
	`amount` integer NOT NULL,
	`unlockedAt` integer,
	`userId` text NOT NULL,
	CONSTRAINT `achievement_userAchievements_pk` PRIMARY KEY(`userId`, `achievementId`),
	CONSTRAINT `fk_achievement_userAchievements_achievementId_achievement_achievements_id_fk` FOREIGN KEY (`achievementId`) REFERENCES `achievement_achievements`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_achievement_userAchievements_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "userAchievements_amount_check" CHECK("amount" >= 1)
);
--> statement-breakpoint
CREATE TABLE `app_bookmarks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`path` text NOT NULL,
	`resourceType` text,
	`title` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `app_bookmarks_pk` PRIMARY KEY(`userId`, `path`),
	CONSTRAINT `fk_app_bookmarks_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "bookmarks_path_length_check" CHECK(LENGTH("path") <= 2048),
	CONSTRAINT "bookmarks_title_length_check" CHECK(LENGTH("title") <= 100)
);
--> statement-breakpoint
CREATE TABLE `auth_accounts` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`accessToken` text,
	`accessTokenExpiresAt` integer,
	`accountId` text NOT NULL,
	`id` text PRIMARY KEY,
	`idToken` text,
	`password` text,
	`providerId` text NOT NULL,
	`refreshToken` text,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`userId` text NOT NULL,
	CONSTRAINT `fk_auth_accounts_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `accounts_providerId_accountId_unique` UNIQUE(`providerId`,`accountId`)
);
--> statement-breakpoint
CREATE TABLE `auth_apiKeys` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`configId` text DEFAULT 'default' NOT NULL,
	`enabled` integer DEFAULT true,
	`expiresAt` integer,
	`id` text PRIMARY KEY,
	`key` text NOT NULL,
	`lastRefillAt` integer,
	`lastRequest` integer,
	`metadata` text,
	`name` text,
	`permissions` text,
	`prefix` text,
	`rateLimitEnabled` integer DEFAULT true,
	`rateLimitMax` integer,
	`rateLimitTimeWindow` integer,
	`referenceId` text NOT NULL,
	`refillAmount` integer,
	`refillInterval` integer,
	`remaining` integer,
	`requestCount` integer DEFAULT 0,
	`start` text,
	CONSTRAINT `fk_auth_apiKeys_referenceId_auth_users_id_fk` FOREIGN KEY (`referenceId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`ipAddress` text,
	`token` text NOT NULL UNIQUE,
	`userAgent` text,
	`userId` text NOT NULL,
	CONSTRAINT `fk_auth_sessions_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `auth_users` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`biography` text DEFAULT '' NOT NULL,
	`deletionRequestedAt` integer,
	`email` text NOT NULL UNIQUE,
	`emailVerified` integer NOT NULL,
	`id` text PRIMARY KEY,
	`image` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`storageBytesUsed` integer DEFAULT 0 NOT NULL,
	`storageTier` text DEFAULT 'Free' NOT NULL,
	CONSTRAINT "users_biography_length_check" CHECK(LENGTH("biography") <= 160),
	CONSTRAINT "users_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE `auth_verifications` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `message_appUsers` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`image` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT "appUsers_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE `message_bans` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`bannedByUserId` text,
	`roomId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `message_bans_pk` PRIMARY KEY(`roomId`, `userId`),
	CONSTRAINT `fk_message_bans_bannedByUserId_auth_users_id_fk` FOREIGN KEY (`bannedByUserId`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_message_bans_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_bans_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_callSessions` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`meetingId` text UNIQUE,
	`roomId` text,
	`threadRootId` integer DEFAULT 0 NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_message_callSessions_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_callSessions_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `callSessions_roomId_threadRootId_unique` UNIQUE(`roomId`,`threadRootId`),
	CONSTRAINT "callSessions_id_length_check" CHECK(LENGTH("id") = 12)
);
--> statement-breakpoint
CREATE TABLE `message_invites` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`expiresAt` integer,
	`id` text PRIMARY KEY,
	`maxUses` integer DEFAULT 0 NOT NULL,
	`roomId` text NOT NULL,
	`userId` text NOT NULL,
	`uses` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_message_invites_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_invites_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "invites_id_length_check" CHECK(LENGTH("id") = 43),
	CONSTRAINT "invites_maxUses_check" CHECK("maxUses" >= 0),
	CONSTRAINT "invites_uses_check" CHECK("uses" >= 0),
	CONSTRAINT "invites_uses_maxUses_check" CHECK("maxUses" = 0 OR "uses" <= "maxUses")
);
--> statement-breakpoint
CREATE TABLE `message_moderationLogs` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`actorUserId` text,
	`durationMs` integer,
	`id` text PRIMARY KEY,
	`roomId` text NOT NULL,
	`targetUserId` text NOT NULL,
	`type` text NOT NULL,
	CONSTRAINT `fk_message_moderationLogs_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_moderationLogs_targetUserId_auth_users_id_fk` FOREIGN KEY (`targetUserId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_moderationNotes` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`actorUserId` text,
	`id` text PRIMARY KEY,
	`note` text NOT NULL,
	`roomId` text NOT NULL,
	`targetUserId` text NOT NULL,
	CONSTRAINT `fk_message_moderationNotes_actorUserId_auth_users_id_fk` FOREIGN KEY (`actorUserId`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_message_moderationNotes_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_moderationNotes_targetUserId_auth_users_id_fk` FOREIGN KEY (`targetUserId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_roomCategories` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_message_roomCategories_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "roomCategories_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100),
	CONSTRAINT "roomCategories_position_check" CHECK("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE `message_roomEmojis` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`roomId` text NOT NULL,
	CONSTRAINT `fk_message_roomEmojis_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT "roomEmojis_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 32),
	CONSTRAINT "roomEmojis_name_charset_check" CHECK("name" <> '' AND "name" NOT GLOB '*[^a-z0-9_]*')
);
--> statement-breakpoint
CREATE TABLE `message_roomFilters` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`action` text DEFAULT 'Reject' NOT NULL,
	`roomId` text PRIMARY KEY,
	`timeoutDurationMs` integer,
	`words` text DEFAULT '[]' NOT NULL,
	CONSTRAINT `fk_message_roomFilters_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT "roomFilters_words_size_check" CHECK(json_array_length("words") <= 1000),
	CONSTRAINT "roomFilters_action_timeoutDurationMs_check" CHECK(("action" = 'Timeout' AND "timeoutDurationMs" IS NOT NULL AND "timeoutDurationMs" > 0) OR ("action" <> 'Timeout' AND "timeoutDurationMs" IS NULL))
);
--> statement-breakpoint
CREATE TABLE `message_roomMemberPermissions` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`allow` text DEFAULT '0' NOT NULL,
	`deny` text DEFAULT '0' NOT NULL,
	`roomId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `message_roomMemberPermissions_pk` PRIMARY KEY(`userId`, `roomId`),
	CONSTRAINT `fk_message_roomMemberPermissions_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_roomMemberPermissions_userId_roomId_message_usersToRooms_userId_roomId_fk` FOREIGN KEY (`userId`,`roomId`) REFERENCES `message_usersToRooms`(`userId`,`roomId`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_roomRoles` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`id` text PRIMARY KEY,
	`isEveryone` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`permissions` text DEFAULT '0' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`roomId` text NOT NULL,
	CONSTRAINT `fk_message_roomRoles_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT "roomRoles_color_length_check" CHECK(LENGTH("color") <= 9),
	CONSTRAINT "roomRoles_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100),
	CONSTRAINT "roomRoles_position_check" CHECK("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE `message_rooms` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`allowedMimeCategories` text DEFAULT '["Audio","Document","Image","Video"]' NOT NULL,
	`id` text PRIMARY KEY,
	`image` text DEFAULT '' NOT NULL,
	`isInvitePaused` integer DEFAULT false NOT NULL,
	`isReadOnly` integer DEFAULT false NOT NULL,
	`maxFileSizeBytes` integer DEFAULT 0 NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`participantKey` text UNIQUE,
	`slowmodeMs` integer DEFAULT 0 NOT NULL,
	`topic` text DEFAULT '' NOT NULL,
	`type` text DEFAULT 'Room' NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_message_rooms_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "rooms_name_check" CHECK(("type" = 'DirectMessage' AND LENGTH(TRIM("name")) = 0) OR ("type" = 'Room' AND LENGTH(TRIM("name")) BETWEEN 1 AND 100)),
	CONSTRAINT "rooms_type_participantKey_check" CHECK(("type" = 'DirectMessage' AND "participantKey" IS NOT NULL) OR ("type" = 'Room' AND "participantKey" IS NULL)),
	CONSTRAINT "rooms_maxFileSizeBytes_check" CHECK("maxFileSizeBytes" >= 0),
	CONSTRAINT "rooms_slowmodeMs_check" CHECK("slowmodeMs" >= 0),
	CONSTRAINT "rooms_topic_length_check" CHECK(LENGTH("topic") <= 500)
);
--> statement-breakpoint
CREATE TABLE `message_searchHistories` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`filters` text DEFAULT '[]' NOT NULL,
	`id` text PRIMARY KEY,
	`query` text DEFAULT '' NOT NULL,
	`roomId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_message_searchHistories_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_searchHistories_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "searchHistories_query_length_check" CHECK(LENGTH("query") <= 10000)
);
--> statement-breakpoint
CREATE TABLE `message_threadFollows` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`isUnfollowed` integer DEFAULT false NOT NULL,
	`roomId` text NOT NULL,
	`threadRootId` integer NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `message_threadFollows_pk` PRIMARY KEY(`roomId`, `threadRootId`, `userId`),
	CONSTRAINT `fk_message_threadFollows_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_threadFollows_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_userSettings` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`autoIdleThresholdMs` integer DEFAULT 600000 NOT NULL,
	`inputSensitivityDecibels` integer DEFAULT -50 NOT NULL,
	`isDeafenOnJoin` integer DEFAULT false NOT NULL,
	`isMuteOnJoin` integer DEFAULT false NOT NULL,
	`microphoneVolumePercentage` integer DEFAULT 100 NOT NULL,
	`noiseSuppressionMode` text DEFAULT 'Custom' NOT NULL,
	`pushToTalkKeybind` text DEFAULT '' NOT NULL,
	`pushToTalkReleaseDelayMs` integer DEFAULT 20 NOT NULL,
	`speakerVolumePercentage` integer DEFAULT 100 NOT NULL,
	`userId` text PRIMARY KEY,
	`virtualBackground` text DEFAULT '' NOT NULL,
	`voiceInputMode` text DEFAULT 'VoiceActivity' NOT NULL,
	CONSTRAINT `fk_message_userSettings_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "userSettings_inputSensitivityDecibels_check" CHECK("inputSensitivityDecibels" BETWEEN -100 AND 0),
	CONSTRAINT "userSettings_microphoneVolumePercentage_check" CHECK("microphoneVolumePercentage" BETWEEN 0 AND 200),
	CONSTRAINT "userSettings_speakerVolumePercentage_check" CHECK("speakerVolumePercentage" BETWEEN 0 AND 200),
	CONSTRAINT "userSettings_autoIdleThresholdMs_check" CHECK("autoIdleThresholdMs" BETWEEN 60000 AND 86400000),
	CONSTRAINT "userSettings_pushToTalkKeybind_length_check" CHECK(LENGTH("pushToTalkKeybind") <= 64),
	CONSTRAINT "userSettings_pushToTalkReleaseDelayMs_check" CHECK("pushToTalkReleaseDelayMs" BETWEEN 0 AND 2000)
);
--> statement-breakpoint
CREATE TABLE `message_userStatuses` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`expiresAt` integer,
	`isConnected` integer DEFAULT true NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text,
	`userId` text PRIMARY KEY,
	CONSTRAINT `fk_message_userStatuses_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "userStatuses_message_length_check" CHECK(LENGTH("message") <= 64)
);
--> statement-breakpoint
CREATE TABLE `message_usersToRoomRoles` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`roleId` text NOT NULL,
	`roomId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `message_usersToRoomRoles_pk` PRIMARY KEY(`userId`, `roomId`, `roleId`),
	CONSTRAINT `fk_message_usersToRoomRoles_roleId_message_roomRoles_id_fk` FOREIGN KEY (`roleId`) REFERENCES `message_roomRoles`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_usersToRoomRoles_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_usersToRoomRoles_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_usersToRoomRoles_userId_roomId_message_usersToRooms_userId_roomId_fk` FOREIGN KEY (`userId`,`roomId`) REFERENCES `message_usersToRooms`(`userId`,`roomId`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `message_usersToRooms` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`categoryId` text,
	`displayName` text DEFAULT '' NOT NULL,
	`isHidden` integer DEFAULT false NOT NULL,
	`lastMessageAt` integer,
	`lastReadAt` integer,
	`mentionCount` integer DEFAULT 0 NOT NULL,
	`notificationType` text DEFAULT 'DirectMessage' NOT NULL,
	`roomId` text NOT NULL,
	`timeoutUntil` integer,
	`userId` text NOT NULL,
	CONSTRAINT `message_usersToRooms_pk` PRIMARY KEY(`userId`, `roomId`),
	CONSTRAINT `fk_message_usersToRooms_categoryId_message_roomCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `message_roomCategories`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_message_usersToRooms_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_usersToRooms_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "usersToRooms_displayName_length_check" CHECK(LENGTH("displayName") <= 32),
	CONSTRAINT "usersToRooms_mentionCount_check" CHECK("mentionCount" >= 0)
);
--> statement-breakpoint
CREATE TABLE `message_webhooks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`creatorId` text NOT NULL,
	`id` text PRIMARY KEY,
	`isActive` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`roomId` text NOT NULL,
	`tokenHash` text NOT NULL CONSTRAINT `webhooks_tokenHash_unique` UNIQUE,
	`userId` text NOT NULL UNIQUE,
	CONSTRAINT `fk_message_webhooks_creatorId_auth_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_webhooks_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_webhooks_userId_message_appUsers_id_fk` FOREIGN KEY (`userId`) REFERENCES `message_appUsers`(`id`) ON DELETE CASCADE,
	CONSTRAINT "webhooks_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE `notification_notifications` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`id` text PRIMARY KEY,
	`isRead` integer DEFAULT false NOT NULL,
	`path` text DEFAULT '' NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_notification_notifications_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `notification_pushSubscriptions` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`auth` text NOT NULL,
	`endpoint` text NOT NULL,
	`expirationTime` integer,
	`id` text PRIMARY KEY,
	`p256dh` text NOT NULL,
	`sessionId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_notification_pushSubscriptions_sessionId_auth_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `auth_sessions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_notification_pushSubscriptions_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `pushSubscriptions_userId_endpoint_unique` UNIQUE(`userId`,`endpoint`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`postId` text NOT NULL,
	`userId` text NOT NULL,
	`value` integer NOT NULL,
	CONSTRAINT `post_likes_pk` PRIMARY KEY(`userId`, `postId`),
	CONSTRAINT `fk_post_likes_postId_post_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `post_posts`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_post_likes_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "likes_value_check" CHECK("value" = 1 OR "value" = -1)
);
--> statement-breakpoint
CREATE TABLE `post_posts` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`ancestorIds` text DEFAULT '[]' NOT NULL,
	`commentCount` integer DEFAULT 0 NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`id` text PRIMARY KEY,
	`likeCount` integer DEFAULT 0 NOT NULL,
	`parentId` text,
	`ranking` real NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_post_posts_parentId_post_posts_id_fk` FOREIGN KEY (`parentId`) REFERENCES `post_posts`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_post_posts_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "posts_title_length_check" CHECK(LENGTH("title") <= 300),
	CONSTRAINT "posts_description_length_check" CHECK(LENGTH("description") <= 1000),
	CONSTRAINT "posts_commentCount_check" CHECK("commentCount" >= 0)
);
--> statement-breakpoint
CREATE TABLE `resource_programParticipants` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`keyValue` text NOT NULL,
	`publicId` text NOT NULL,
	`resourceId` text NOT NULL,
	`tokenHash` text NOT NULL CONSTRAINT `programParticipants_tokenHash_unique` UNIQUE,
	CONSTRAINT `fk_resource_programParticipants_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `programParticipants_resourceId_keyValue_unique` UNIQUE(`resourceId`,`keyValue`)
);
--> statement-breakpoint
CREATE TABLE `resource_resourceAccesses` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`accessedAt` integer NOT NULL,
	`resourceId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `resource_resourceAccesses_pk` PRIMARY KEY(`userId`, `resourceId`),
	CONSTRAINT `fk_resource_resourceAccesses_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_resource_resourceAccesses_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `resource_resourceActivities` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`activityType` text NOT NULL,
	`apiKeyId` text,
	`apiKeyName` text DEFAULT '' NOT NULL,
	`id` text PRIMARY KEY,
	`newName` text,
	`oldName` text,
	`publishVersion` integer,
	`resourceId` text NOT NULL,
	`userId` text,
	CONSTRAINT `fk_resource_resourceActivities_apiKeyId_auth_apiKeys_id_fk` FOREIGN KEY (`apiKeyId`) REFERENCES `auth_apiKeys`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_resource_resourceActivities_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_resource_resourceActivities_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `resource_resourceFavorites` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`resourceId` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `resource_resourceFavorites_pk` PRIMARY KEY(`userId`, `resourceId`),
	CONSTRAINT `fk_resource_resourceFavorites_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_resource_resourceFavorites_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `resource_resourceLinks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`sourceId` text NOT NULL,
	`targetId` text NOT NULL,
	`type` text NOT NULL,
	CONSTRAINT `resource_resourceLinks_pk` PRIMARY KEY(`sourceId`, `type`, `targetId`),
	CONSTRAINT `fk_resource_resourceLinks_sourceId_resource_resources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `resource_resourceObjectLocks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`holder` text NOT NULL,
	`resourceId` text PRIMARY KEY,
	CONSTRAINT `fk_resource_resourceObjectLocks_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `resource_resourcePublications` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer NOT NULL,
	`publishedContentVersion` integer DEFAULT 0 NOT NULL,
	`publishVersion` integer DEFAULT 1 NOT NULL,
	`resourceId` text PRIMARY KEY,
	CONSTRAINT `fk_resource_resourcePublications_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `resource_resources` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`contentHash` text DEFAULT '' NOT NULL,
	`contentSize` integer DEFAULT 0 NOT NULL,
	`contentVersion` integer DEFAULT 0 NOT NULL,
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`revisionTakenAt` integer,
	`revisionVersion` integer DEFAULT 0 NOT NULL,
	`tags` text DEFAULT '{}' NOT NULL,
	`type` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_resource_resources_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "resources_name_length_check" CHECK(LENGTH(TRIM("name")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
CREATE TABLE `resource_resourceVersionAssets` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`assetHash` text NOT NULL,
	`channel` text NOT NULL,
	`resourceId` text NOT NULL,
	`version` integer NOT NULL,
	CONSTRAINT `resource_resourceVersionAssets_pk` PRIMARY KEY(`resourceId`, `channel`, `version`, `assetHash`),
	CONSTRAINT `fk_resource_resourceVersionAssets_resourceId_channel_version_resource_resourceVersions_resourceId_channel_version_fk` FOREIGN KEY (`resourceId`,`channel`,`version`) REFERENCES `resource_resourceVersions`(`resourceId`,`channel`,`version`) ON DELETE CASCADE,
	CONSTRAINT "resourceVersionAssets_assetHash_check" CHECK(LENGTH("assetHash") = 64 AND "assetHash" NOT GLOB '*[^0-9a-f]*')
);
--> statement-breakpoint
CREATE TABLE `resource_resourceVersions` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`baseHash` text DEFAULT '' NOT NULL,
	`channel` text NOT NULL,
	`hash` text NOT NULL,
	`plaintextBytes` integer NOT NULL,
	`reason` text,
	`resourceId` text NOT NULL,
	`storedBytes` integer NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`version` integer NOT NULL,
	CONSTRAINT `resource_resourceVersions_pk` PRIMARY KEY(`resourceId`, `channel`, `version`),
	CONSTRAINT `fk_resource_resourceVersions_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT "resourceVersions_plaintextBytes_check" CHECK("plaintextBytes" >= 0),
	CONSTRAINT "resourceVersions_storedBytes_check" CHECK("storedBytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE `resource_resourceViews` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`id` text PRIMARY KEY,
	`resourceId` text NOT NULL,
	`utcDate` text NOT NULL,
	CONSTRAINT `fk_resource_resourceViews_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `resourceViews_resourceId_utcDate_unique` UNIQUE(`resourceId`,`utcDate`),
	CONSTRAINT "resourceViews_count_check" CHECK("count" >= 0)
);
--> statement-breakpoint
CREATE TABLE `resource_resourceWorkingAssets` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`assetHash` text NOT NULL,
	`resourceId` text NOT NULL,
	CONSTRAINT `resource_resourceWorkingAssets_pk` PRIMARY KEY(`resourceId`, `assetHash`),
	CONSTRAINT `fk_resource_resourceWorkingAssets_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT "resourceWorkingAssets_assetHash_check" CHECK(LENGTH("assetHash") = 64 AND "assetHash" NOT GLOB '*[^0-9a-f]*')
);
--> statement-breakpoint
CREATE TABLE `resource_surveyResponses` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`isDraft` integer DEFAULT false NOT NULL,
	`model` text DEFAULT '{}' NOT NULL,
	`modelVersion` integer DEFAULT 0 NOT NULL,
	`pageNo` integer DEFAULT 0 NOT NULL,
	`participantTokenHash` text DEFAULT '' NOT NULL,
	`resourceId` text NOT NULL,
	CONSTRAINT `fk_resource_surveyResponses_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `social_blocks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`blockedId` text NOT NULL,
	`blockerId` text NOT NULL,
	CONSTRAINT `social_blocks_pk` PRIMARY KEY(`blockerId`, `blockedId`),
	CONSTRAINT `fk_social_blocks_blockedId_auth_users_id_fk` FOREIGN KEY (`blockedId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_social_blocks_blockerId_auth_users_id_fk` FOREIGN KEY (`blockerId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "blocks_blockerId_blockedId_check" CHECK("blockerId" != "blockedId")
);
--> statement-breakpoint
CREATE TABLE `social_friendRequests` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`receiverId` text NOT NULL,
	`senderId` text NOT NULL,
	CONSTRAINT `fk_social_friendRequests_receiverId_auth_users_id_fk` FOREIGN KEY (`receiverId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_social_friendRequests_senderId_auth_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "friendRequests_senderId_receiverId_check" CHECK("senderId" != "receiverId")
);
--> statement-breakpoint
CREATE TABLE `social_friends` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`receiverId` text NOT NULL,
	`senderId` text NOT NULL,
	CONSTRAINT `fk_social_friends_receiverId_auth_users_id_fk` FOREIGN KEY (`receiverId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_social_friends_senderId_auth_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "friends_senderId_receiverId_check" CHECK("senderId" != "receiverId")
);
--> statement-breakpoint
CREATE TABLE `storage_storageLedger` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`blobName` text NOT NULL,
	`containerName` text NOT NULL,
	`countedBytes` integer NOT NULL,
	`declaredBytes` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`reconciledAt` integer,
	`sequencer` text,
	`userId` text NOT NULL,
	CONSTRAINT `storage_storageLedger_pk` PRIMARY KEY(`containerName`, `blobName`),
	CONSTRAINT `fk_storage_storageLedger_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "storageLedger_declaredBytes_check" CHECK("declaredBytes" >= 0),
	CONSTRAINT "storageLedger_countedBytes_check" CHECK("countedBytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE `user_dataExports` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`blobName` text,
	`expiresAt` integer,
	`failureReason` text,
	`id` text PRIMARY KEY,
	`readyAt` integer,
	`requestedAt` integer NOT NULL,
	`status` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `fk_user_dataExports_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `accounts_userId_index` ON `auth_accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `apiKeys_configId_index` ON `auth_apiKeys` (`configId`);--> statement-breakpoint
CREATE INDEX `apiKeys_key_index` ON `auth_apiKeys` (`key`);--> statement-breakpoint
CREATE INDEX `apiKeys_referenceId_index` ON `auth_apiKeys` (`referenceId`);--> statement-breakpoint
CREATE INDEX `sessions_userId_index` ON `auth_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `invites_roomId_index` ON `message_invites` (`roomId`);--> statement-breakpoint
CREATE INDEX `moderationLogs_roomId_id_index` ON `message_moderationLogs` (`roomId`,`id`);--> statement-breakpoint
CREATE INDEX `moderationLogs_actorUserId_index` ON `message_moderationLogs` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `moderationLogs_targetUserId_index` ON `message_moderationLogs` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `moderationNotes_roomId_targetUserId_id_index` ON `message_moderationNotes` (`roomId`,`targetUserId`,`id`);--> statement-breakpoint
CREATE INDEX `moderationNotes_actorUserId_index` ON `message_moderationNotes` (`actorUserId`);--> statement-breakpoint
CREATE INDEX `moderationNotes_targetUserId_index` ON `message_moderationNotes` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `roomCategories_userId_index` ON `message_roomCategories` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `roomEmojis_roomId_name_unique` ON `message_roomEmojis` (`roomId`,`name`);--> statement-breakpoint
CREATE INDEX `roomMemberPermissions_roomId_index` ON `message_roomMemberPermissions` (`roomId`);--> statement-breakpoint
CREATE INDEX `roomRoles_roomId_position_index` ON `message_roomRoles` (`roomId`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `roomRoles_roomId_isEveryone_unique` ON `message_roomRoles` (`roomId`) WHERE "message_roomRoles"."isEveryone" = 1;--> statement-breakpoint
CREATE INDEX `searchHistories_userId_roomId_index` ON `message_searchHistories` (`userId`,`roomId`);--> statement-breakpoint
CREATE INDEX `searchHistories_roomId_index` ON `message_searchHistories` (`roomId`);--> statement-breakpoint
CREATE INDEX `usersToRoomRoles_roleId_index` ON `message_usersToRoomRoles` (`roleId`);--> statement-breakpoint
CREATE INDEX `usersToRoomRoles_roomId_userId_index` ON `message_usersToRoomRoles` (`roomId`,`userId`);--> statement-breakpoint
CREATE INDEX `usersToRooms_roomId_index` ON `message_usersToRooms` (`roomId`);--> statement-breakpoint
CREATE INDEX `usersToRooms_categoryId_index` ON `message_usersToRooms` (`categoryId`) WHERE "message_usersToRooms"."categoryId" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `usersToRooms_timeoutUntil_index` ON `message_usersToRooms` (`timeoutUntil`) WHERE "message_usersToRooms"."timeoutUntil" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `webhooks_roomId_index` ON `message_webhooks` (`roomId`);--> statement-breakpoint
CREATE INDEX `notifications_userId_id_index` ON `notification_notifications` (`userId`,"id" DESC);--> statement-breakpoint
CREATE INDEX `notifications_userId_createdAt_index` ON `notification_notifications` (`userId`,"createdAt" DESC);--> statement-breakpoint
CREATE INDEX `notifications_userId_isRead_index` ON `notification_notifications` (`userId`) WHERE "notification_notifications"."isRead" = 0;--> statement-breakpoint
CREATE INDEX `pushSubscriptions_sessionId_index` ON `notification_pushSubscriptions` (`sessionId`);--> statement-breakpoint
CREATE INDEX `likes_postId_index` ON `post_likes` (`postId`);--> statement-breakpoint
CREATE INDEX `posts_parentId_ranking_index` ON `post_posts` (`parentId`,"ranking" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX `posts_userId_ranking_index` ON `post_posts` (`userId`,"ranking" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX `resourceAccesses_userId_accessedAt_index` ON `resource_resourceAccesses` (`userId`,`accessedAt`);--> statement-breakpoint
CREATE INDEX `resourceActivities_resourceId_id_index` ON `resource_resourceActivities` (`resourceId`,`id`);--> statement-breakpoint
CREATE INDEX `resourceActivities_resourceId_createdAt_id_index` ON `resource_resourceActivities` (`resourceId`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `resourceActivities_apiKeyId_index` ON `resource_resourceActivities` (`apiKeyId`);--> statement-breakpoint
CREATE INDEX `resourceActivities_userId_index` ON `resource_resourceActivities` (`userId`);--> statement-breakpoint
CREATE INDEX `resourceLinks_target_index` ON `resource_resourceLinks` (`targetId`,`type`);--> statement-breakpoint
CREATE INDEX `resources_userId_index` ON `resource_resources` (`userId`);--> statement-breakpoint
CREATE INDEX `surveyResponses_resourceId_isDraft_id_index` ON `resource_surveyResponses` (`resourceId`,`isDraft`,`id`);--> statement-breakpoint
CREATE INDEX `blocks_blockedId_index` ON `social_blocks` (`blockedId`);--> statement-breakpoint
CREATE INDEX `friendRequests_receiverId_index` ON `social_friendRequests` (`receiverId`);--> statement-breakpoint
CREATE INDEX `friendRequests_senderId_index` ON `social_friendRequests` (`senderId`);--> statement-breakpoint
CREATE INDEX `friends_receiverId_index` ON `social_friends` (`receiverId`);--> statement-breakpoint
CREATE INDEX `friends_senderId_index` ON `social_friends` (`senderId`);--> statement-breakpoint
CREATE INDEX `storageLedger_userId_reconciledAt_index` ON `storage_storageLedger` (`userId`,`reconciledAt`);--> statement-breakpoint
CREATE UNIQUE INDEX `dataExports_userId_status_unique` ON `user_dataExports` (`userId`) WHERE "user_dataExports"."status" IN ('queued', 'building');--> statement-breakpoint
CREATE INDEX `dataExports_userId_index` ON `user_dataExports` (`userId`);--> statement-breakpoint
CREATE VIRTUAL TABLE `resources_search` USING fts5(`name`, `tags`, `id` UNINDEXED, tokenize = 'unicode61 remove_diacritics 2');--> statement-breakpoint
CREATE TRIGGER `resource_resources_search_insert` AFTER INSERT ON `resource_resources` BEGIN
	INSERT INTO `resources_search` (`id`, `name`, `tags`) VALUES (new.`id`, new.`name`, (SELECT group_concat(`key` || ' ' || `value`, ' ') FROM json_each(new.`tags`)));
END;--> statement-breakpoint
CREATE TRIGGER `resource_resources_search_update` AFTER UPDATE OF `name`, `tags` ON `resource_resources` BEGIN
	DELETE FROM `resources_search` WHERE `id` = old.`id`;
	INSERT INTO `resources_search` (`id`, `name`, `tags`) VALUES (new.`id`, new.`name`, (SELECT group_concat(`key` || ' ' || `value`, ' ') FROM json_each(new.`tags`)));
END;--> statement-breakpoint
CREATE TRIGGER `resource_resources_search_delete` AFTER DELETE ON `resource_resources` BEGIN
	DELETE FROM `resources_search` WHERE `id` = old.`id`;
END;
