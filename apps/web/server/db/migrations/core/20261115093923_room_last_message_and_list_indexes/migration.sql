ALTER TABLE `message_rooms` ADD `lastMessageAt` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `message_rooms` SET `lastMessageAt` = `updatedAt`;--> statement-breakpoint
CREATE TABLE `__keep_message_webhooks` AS SELECT * FROM `message_webhooks`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_appUsers` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`image` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_message_appUsers`(`createdAt`, `deletedAt`, `updatedAt`, `id`, `image`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `id`, `image` FROM `message_appUsers`;--> statement-breakpoint
DROP TABLE `message_appUsers`;--> statement-breakpoint
ALTER TABLE `__new_message_appUsers` RENAME TO `message_appUsers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
INSERT INTO `message_webhooks` SELECT * FROM `__keep_message_webhooks`;--> statement-breakpoint
DROP TABLE `__keep_message_webhooks`;--> statement-breakpoint
DROP INDEX IF EXISTS `invites_roomId_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `resourceAccesses_userId_accessedAt_index`;--> statement-breakpoint
DROP INDEX IF EXISTS `resources_userId_index`;--> statement-breakpoint
CREATE INDEX `invites_roomId_createdAt_id_index` ON `message_invites` (`roomId`,"createdAt" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX `posts_parentId_id_index` ON `post_posts` (`parentId`,"id" DESC);--> statement-breakpoint
CREATE INDEX `posts_parentId_likeCount_index` ON `post_posts` (`parentId`,"likeCount" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX `posts_userId_id_index` ON `post_posts` (`userId`,"id" DESC);--> statement-breakpoint
CREATE INDEX `posts_userId_likeCount_index` ON `post_posts` (`userId`,"likeCount" DESC,"id" DESC);--> statement-breakpoint
CREATE INDEX `posts_firstAncestorId_index` ON `post_posts` (json_extract("ancestorIds", '$[0]'));--> statement-breakpoint
CREATE INDEX `resourceAccesses_userId_accessedAt_resourceId_index` ON `resource_resourceAccesses` (`userId`,`accessedAt`,`resourceId`);--> statement-breakpoint
CREATE INDEX `resources_userId_createdAt_id_index` ON `resource_resources` (`userId`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `resources_userId_deletedAt_id_index` ON `resource_resources` (`userId`,`deletedAt`,`id`);--> statement-breakpoint
CREATE INDEX `resources_userId_name_id_index` ON `resource_resources` (`userId`,`name`,`id`);--> statement-breakpoint
CREATE INDEX `resources_userId_type_id_index` ON `resource_resources` (`userId`,`type`,`id`);--> statement-breakpoint
CREATE INDEX `resources_userId_updatedAt_id_index` ON `resource_resources` (`userId`,`updatedAt`,`id`);