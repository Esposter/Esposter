CREATE TABLE `admittedSessions` (
	`sessionId` text PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE `callState` (
	`id` integer PRIMARY KEY,
	`meetingId` text NOT NULL,
	`startedAt` integer
);
--> statement-breakpoint
CREATE TABLE `knockers` (
	`id` text PRIMARY KEY,
	`image` text,
	`isCameraEnabled` integer NOT NULL,
	`isHandRaised` integer NOT NULL,
	`isMuted` integer NOT NULL,
	`name` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY,
	`image` text,
	`isCameraEnabled` integer NOT NULL,
	`isHandRaised` integer NOT NULL,
	`isMuted` integer NOT NULL,
	`name` text NOT NULL,
	`userId` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `realtimeKitParticipants` (
	`isRejoining` integer NOT NULL,
	`publishSources` text NOT NULL,
	`realtimeKitParticipantId` text NOT NULL,
	`sessionId` text PRIMARY KEY
);
