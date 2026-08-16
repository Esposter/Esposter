ALTER TABLE "message"."callSessions" DROP CONSTRAINT "call_sessions_roomId_key";--> statement-breakpoint
ALTER TABLE "message"."callSessions" ADD COLUMN "threadRootRowKey" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."callSessions" ADD CONSTRAINT "callSessions_roomId_threadRootRowKey_unique" UNIQUE("roomId","threadRootRowKey");