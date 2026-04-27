CREATE TYPE "public"."user_status" AS ENUM('DoNotDisturb', 'Idle', 'Offline', 'Online');--> statement-breakpoint
CREATE TABLE "user_statuses" (
	"expiresAt" timestamp,
	"lastActiveAt" timestamp DEFAULT now() NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" "user_status",
	"userId" text PRIMARY KEY NOT NULL,
	CONSTRAINT "message" CHECK (LENGTH("user_statuses"."message") <= 1000)
);
--> statement-breakpoint
ALTER TABLE "user_statuses" ADD CONSTRAINT "user_statuses_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;