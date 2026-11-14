-- A call is keyed by its thread's root message id now, and 0 for the room's own call. A thread call's old key is a row key
-- that names no message id, so it cannot be re-keyed and its row is dropped; a room call keeps its row and becomes 0
DELETE FROM `message_callSessions` WHERE `threadRootRowKey` <> '';--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_callSessions` (
	`createdAt` integer NOT NULL,
	`deletedAt` integer,
	`updatedAt` integer NOT NULL,
	`id` text PRIMARY KEY,
	`roomId` text,
	`threadRootId` integer DEFAULT 0 NOT NULL,
	`meetingId` text UNIQUE,
	`userId` text NOT NULL,
	CONSTRAINT `fk_message_callSessions_roomId_message_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `message_rooms`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_message_callSessions_userId_auth_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `auth_users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `callSessions_roomId_threadRootId_unique` UNIQUE(`roomId`,`threadRootId`),
	CONSTRAINT "callSessions_id_length_check" CHECK(LENGTH("id") = 12)
);
--> statement-breakpoint
INSERT INTO `__new_message_callSessions`(`createdAt`, `deletedAt`, `updatedAt`, `id`, `roomId`, `meetingId`, `userId`) SELECT `createdAt`, `deletedAt`, `updatedAt`, `id`, `roomId`, `meetingId`, `userId` FROM `message_callSessions`;--> statement-breakpoint
DROP TABLE `message_callSessions`;--> statement-breakpoint
ALTER TABLE `__new_message_callSessions` RENAME TO `message_callSessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;