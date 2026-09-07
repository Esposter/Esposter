CREATE TABLE "message"."scheduledMessageJobs" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"cancelledAt" timestamp,
	"completedAt" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"payload" jsonb NOT NULL,
	"roomId" uuid NOT NULL,
	"runAt" timestamp NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "scheduled_message_jobs_payload_type_check" CHECK (
          ("payload"->>'type' = 'Reminder' AND "payload" ? 'text')
          OR ("payload"->>'type' = 'ScheduledMessage' AND "payload" ? 'message')
        )
);
--> statement-breakpoint
CREATE INDEX "scheduled_message_jobs_userId_roomId_runAt_index" ON "message"."scheduledMessageJobs" ("userId","roomId","runAt");--> statement-breakpoint
ALTER TABLE "message"."scheduledMessageJobs" ADD CONSTRAINT "scheduledMessageJobs_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."scheduledMessageJobs" ADD CONSTRAINT "scheduledMessageJobs_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;