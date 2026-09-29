CREATE TABLE "auth"."apiKeys" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"configId" text DEFAULT 'default' NOT NULL,
	"enabled" boolean DEFAULT true,
	"expiresAt" timestamp,
	"id" text PRIMARY KEY,
	"key" text NOT NULL,
	"lastRefillAt" timestamp,
	"lastRequest" timestamp,
	"metadata" text,
	"name" text,
	"permissions" text,
	"prefix" text,
	"rateLimitEnabled" boolean DEFAULT true,
	"rateLimitMax" integer,
	"rateLimitTimeWindow" integer,
	"referenceId" text NOT NULL,
	"refillAmount" integer,
	"refillInterval" integer,
	"remaining" integer,
	"requestCount" integer DEFAULT 0,
	"start" text
);
--> statement-breakpoint
CREATE INDEX "apiKeys_configId_index" ON "auth"."apiKeys" ("configId");--> statement-breakpoint
CREATE INDEX "apiKeys_key_index" ON "auth"."apiKeys" ("key");--> statement-breakpoint
CREATE INDEX "apiKeys_referenceId_index" ON "auth"."apiKeys" ("referenceId");--> statement-breakpoint
ALTER TABLE "auth"."apiKeys" ADD CONSTRAINT "apiKeys_referenceId_users_id_fkey" FOREIGN KEY ("referenceId") REFERENCES "auth"."users"("id") ON DELETE CASCADE;