DROP TABLE "Survey";

CREATE TABLE IF NOT EXISTS "Survey" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"id" serial PRIMARY KEY NOT NULL,
	"creatorId" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"group" text,
	"model" text DEFAULT '' NOT NULL,
	"modelVersion" integer DEFAULT 0 NOT NULL,
	"publishVersion" integer DEFAULT 0 NOT NULL,
	"publishedAt" timestamp
);