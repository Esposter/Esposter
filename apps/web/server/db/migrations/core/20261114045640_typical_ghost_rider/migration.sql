PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_roomMemberPermissions` (
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
INSERT INTO `__new_message_roomMemberPermissions`(`createdAt`, `deletedAt`, `updatedAt`, `allow`, `deny`, `roomId`, `userId`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `allow`, `deny`, `roomId`, `userId` FROM `message_roomMemberPermissions`;--> statement-breakpoint
DROP TABLE `message_roomMemberPermissions`;--> statement-breakpoint
ALTER TABLE `__new_message_roomMemberPermissions` RENAME TO `message_roomMemberPermissions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_roomRoles` (
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
INSERT INTO `__new_message_roomRoles`(`createdAt`, `deletedAt`, `updatedAt`, `color`, `id`, `isEveryone`, `name`, `permissions`, `position`, `roomId`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `color`, `id`, `isEveryone`, `name`, `permissions`, `position`, `roomId` FROM `message_roomRoles`;--> statement-breakpoint
DROP TABLE `message_roomRoles`;--> statement-breakpoint
ALTER TABLE `__new_message_roomRoles` RENAME TO `message_roomRoles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `roomMemberPermissions_roomId_index` ON `message_roomMemberPermissions` (`roomId`);--> statement-breakpoint
CREATE INDEX `roomRoles_roomId_position_index` ON `message_roomRoles` (`roomId`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `roomRoles_roomId_isEveryone_unique` ON `message_roomRoles` (`roomId`) WHERE "message_roomRoles"."isEveryone" = 1;
--> statement-breakpoint
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
