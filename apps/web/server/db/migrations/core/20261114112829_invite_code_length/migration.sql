PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_invites` (
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
-- Invite codes were 8 characters and are now 43, so a code issued before this cannot be lengthened without breaking
-- the link already shared: those invites are retired, and their rows are not copied
DELETE FROM `message_invites` WHERE LENGTH(`id`) <> 43;--> statement-breakpoint
INSERT INTO `__new_message_invites`(`createdAt`, `deletedAt`, `updatedAt`, `expiresAt`, `id`, `maxUses`, `roomId`, `userId`, `uses`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `expiresAt`, `id`, `maxUses`, `roomId`, `userId`, `uses` FROM `message_invites`;--> statement-breakpoint
DROP TABLE `message_invites`;--> statement-breakpoint
ALTER TABLE `__new_message_invites` RENAME TO `message_invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `invites_roomId_index` ON `message_invites` (`roomId`);