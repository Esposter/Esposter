CREATE TABLE `__new_realtimeKitParticipants` (
	`connectedAt` integer NOT NULL,
	`isRejoining` integer NOT NULL,
	`publishSources` text NOT NULL,
	`realtimeKitParticipantId` text NOT NULL,
	`sessionId` text PRIMARY KEY
);--> statement-breakpoint
INSERT INTO `__new_realtimeKitParticipants`(`connectedAt`, `isRejoining`, `publishSources`, `realtimeKitParticipantId`, `sessionId`) SELECT 0, `isRejoining`, `publishSources`, `realtimeKitParticipantId`, `sessionId` FROM `realtimeKitParticipants`;--> statement-breakpoint
DROP TABLE `realtimeKitParticipants`;--> statement-breakpoint
ALTER TABLE `__new_realtimeKitParticipants` RENAME TO `realtimeKitParticipants`;
