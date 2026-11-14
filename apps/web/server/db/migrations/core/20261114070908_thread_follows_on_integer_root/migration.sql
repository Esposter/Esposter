-- A thread root is now the integer id its room's object numbers its message with. Rows keyed by the old text message ids
-- name no message, so they are dropped with the table rather than copied.
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_threadFollows` (
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
DROP TABLE `message_threadFollows`;--> statement-breakpoint
ALTER TABLE `__new_message_threadFollows` RENAME TO `message_threadFollows`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
