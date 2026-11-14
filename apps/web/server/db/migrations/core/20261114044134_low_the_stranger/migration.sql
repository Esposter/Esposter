PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_messages` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`appUserId` text,
	`appUserImage` text DEFAULT '' NOT NULL,
	`filenames` text DEFAULT '' NOT NULL,
	`files` text DEFAULT '[]' NOT NULL,
	`id` text PRIMARY KEY,
	`isEdited` integer DEFAULT false NOT NULL,
	`isForward` integer DEFAULT false NOT NULL,
	`isPinned` integer DEFAULT false NOT NULL,
	`linkPreviewResponse` text,
	`mentions` text DEFAULT '[]' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`replyToId` text,
	`roomId` text NOT NULL,
	`senderName` text,
	`type` text NOT NULL,
	`userId` text,
	CONSTRAINT `fk_message_messages_appUserId_message_appUsers_id_fk` FOREIGN KEY (`appUserId`) REFERENCES `message_appUsers`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_message_messages_replyToId_message_messages_id_fk` FOREIGN KEY (`replyToId`) REFERENCES `message_messages`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_message_messages_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_messages_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_message_messages`(`createdAt`, `deletedAt`, `updatedAt`, `appUserId`, `appUserImage`, `filenames`, `files`, `id`, `isEdited`, `isForward`, `isPinned`, `linkPreviewResponse`, `mentions`, `message`, `replyToId`, `roomId`, `senderName`, `type`, `userId`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `appUserId`, `appUserImage`, `filenames`, `files`, `id`, `isEdited`, `isForward`, `isPinned`, `linkPreviewResponse`, `mentions`, `message`, `replyToId`, `roomId`, `senderName`, `type`, `userId` FROM `message_messages`;--> statement-breakpoint
DROP TABLE `message_messages`;--> statement-breakpoint
ALTER TABLE `__new_message_messages` RENAME TO `message_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `messages_roomId_createdAt_id_index` ON `message_messages` (`roomId`,`createdAt`,`id`);--> statement-breakpoint
CREATE INDEX `messages_replyToId_index` ON `message_messages` (`replyToId`);--> statement-breakpoint
CREATE INDEX `messages_roomId_userId_index` ON `message_messages` (`roomId`,`userId`);--> statement-breakpoint
DROP TABLE `messages_search`;--> statement-breakpoint
CREATE VIRTUAL TABLE `messages_search` USING fts5(`messageId` UNINDEXED, `message`, `filenames`, `senderName`, tokenize = 'porter unicode61 remove_diacritics 2');--> statement-breakpoint
INSERT INTO `messages_search` (`messageId`, `message`, `filenames`, `senderName`) SELECT `id`, `message`, `filenames`, `senderName` FROM `message_messages`;--> statement-breakpoint
CREATE TRIGGER `message_messages_search_insert` AFTER INSERT ON `message_messages` BEGIN
	INSERT INTO `messages_search` (`messageId`, `message`, `filenames`, `senderName`) VALUES (new.`id`, new.`message`, new.`filenames`, new.`senderName`);
END;--> statement-breakpoint
CREATE TRIGGER `message_messages_search_delete` AFTER DELETE ON `message_messages` BEGIN
	DELETE FROM `messages_search` WHERE `messageId` = old.`id`;
END;--> statement-breakpoint
CREATE TRIGGER `message_messages_search_update` AFTER UPDATE OF `message`, `filenames`, `senderName` ON `message_messages` BEGIN
	DELETE FROM `messages_search` WHERE `messageId` = old.`id`;
	INSERT INTO `messages_search` (`messageId`, `message`, `filenames`, `senderName`) VALUES (new.`id`, new.`message`, new.`filenames`, new.`senderName`);
END;
