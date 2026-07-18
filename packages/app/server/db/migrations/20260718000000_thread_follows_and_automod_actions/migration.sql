CREATE TYPE "word_filter_action" AS ENUM('Reject', 'Timeout', 'Warn');--> statement-breakpoint
CREATE TABLE "message"."threadFollows" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"roomId" uuid NOT NULL,
	"threadRootRowKey" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "threadFollows_pkey" PRIMARY KEY("userId","roomId","threadRootRowKey")
);
--> statement-breakpoint
ALTER TABLE "message"."threadFollows" ADD CONSTRAINT "threadFollows_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."threadFollows" ADD CONSTRAINT "threadFollows_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD COLUMN "action" "word_filter_action" DEFAULT 'Reject'::"word_filter_action" NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD COLUMN "timeoutDurationMs" integer;--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD CONSTRAINT "room_filters_timeout_duration_check" CHECK ("action" <> 'Timeout' OR ("timeoutDurationMs" IS NOT NULL AND "timeoutDurationMs" > 0));
