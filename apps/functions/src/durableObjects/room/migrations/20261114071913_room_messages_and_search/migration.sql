CREATE TABLE `messageEmojis` (
	`emojiTag` text NOT NULL,
	`messageId` integer NOT NULL,
	`userIds` text DEFAULT '[]' NOT NULL,
	CONSTRAINT `messageEmojis_pk` PRIMARY KEY(`messageId`, `emojiTag`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`appUserId` text,
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`filenames` text DEFAULT '' NOT NULL,
	`files` text DEFAULT '[]' NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`isEdited` integer DEFAULT false NOT NULL,
	`isForward` integer DEFAULT false NOT NULL,
	`isPinned` integer DEFAULT false NOT NULL,
	`linkPreviewResponse` text,
	`mentions` text DEFAULT '[]' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`replyToId` integer,
	`senderName` text,
	`type` text NOT NULL,
	`updatedAt` integer NOT NULL,
	`userId` text
);
--> statement-breakpoint
CREATE TABLE `onlineMembers` (
	`userId` text PRIMARY KEY
);
--> statement-breakpoint
CREATE VIRTUAL TABLE `messages_search` USING fts5(`message`, `filenames`, `senderName`, content='messages', content_rowid='id', tokenize = 'porter unicode61 remove_diacritics 2');--> statement-breakpoint
CREATE TRIGGER `messages_search_insert` AFTER INSERT ON `messages` BEGIN
	INSERT INTO `messages_search` (`rowid`, `message`, `filenames`, `senderName`) VALUES (new.`id`, new.`message`, new.`filenames`, new.`senderName`);
END;--> statement-breakpoint
CREATE TRIGGER `messages_search_delete` AFTER DELETE ON `messages` BEGIN
	INSERT INTO `messages_search` (`messages_search`, `rowid`, `message`, `filenames`, `senderName`) VALUES ('delete', old.`id`, old.`message`, old.`filenames`, old.`senderName`);
END;--> statement-breakpoint
CREATE TRIGGER `messages_search_update` AFTER UPDATE OF `message`, `filenames`, `senderName` ON `messages` BEGIN
	INSERT INTO `messages_search` (`messages_search`, `rowid`, `message`, `filenames`, `senderName`) VALUES ('delete', old.`id`, old.`message`, old.`filenames`, old.`senderName`);
	INSERT INTO `messages_search` (`rowid`, `message`, `filenames`, `senderName`) VALUES (new.`id`, new.`message`, new.`filenames`, new.`senderName`);
END;
