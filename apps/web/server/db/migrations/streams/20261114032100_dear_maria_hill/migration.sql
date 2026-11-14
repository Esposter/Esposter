CREATE TABLE `Messages` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `Messages_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `MessagesMetadata` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `MessagesMetadata_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `ModerationLog` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `ModerationLog_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `ModerationNotes` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `ModerationNotes_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `ProgramParticipants` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `ProgramParticipants_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `ResourceActivity` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `ResourceActivity_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `ResourceViews` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `ResourceViews_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
--> statement-breakpoint
CREATE TABLE `SurveyResponses` (
	`entity` text NOT NULL,
	`etag` text NOT NULL,
	`partitionKey` text NOT NULL,
	`rowKey` text NOT NULL,
	CONSTRAINT `SurveyResponses_pk` PRIMARY KEY(`partitionKey`, `rowKey`)
);
