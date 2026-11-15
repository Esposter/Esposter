ALTER TABLE `app_bookmarks` ADD `resourceId` text REFERENCES resource_resources(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `app_bookmarks` ADD `roomId` text REFERENCES message_rooms(id) ON DELETE CASCADE;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_app_bookmarks` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`path` text NOT NULL,
	`resourceId` text,
	`roomId` text,
	`title` text NOT NULL,
	`userId` text NOT NULL,
	CONSTRAINT `app_bookmarks_pk` PRIMARY KEY(`userId`, `path`),
	CONSTRAINT `fk_app_bookmarks_resourceId_resource_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `resource_resources`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_app_bookmarks_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_app_bookmarks_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT "bookmarks_path_length_check" CHECK(LENGTH("path") <= 2048),
	CONSTRAINT "bookmarks_title_length_check" CHECK(LENGTH("title") <= 100),
	CONSTRAINT "bookmarks_resourceId_roomId_check" CHECK("resourceId" IS NULL OR "roomId" IS NULL)
);
--> statement-breakpoint
INSERT INTO `__new_app_bookmarks`(`createdAt`, `deletedAt`, `updatedAt`, `path`, `title`, `userId`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `path`, `title`, `userId` FROM `app_bookmarks`;--> statement-breakpoint
DROP TABLE `app_bookmarks`;--> statement-breakpoint
ALTER TABLE `__new_app_bookmarks` RENAME TO `app_bookmarks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `bookmarks_resourceId_index` ON `app_bookmarks` (`resourceId`) WHERE "app_bookmarks"."resourceId" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `bookmarks_roomId_index` ON `app_bookmarks` (`roomId`) WHERE "app_bookmarks"."roomId" IS NOT NULL;