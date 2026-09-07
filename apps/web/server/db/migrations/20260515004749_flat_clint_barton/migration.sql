DELETE FROM "message"."call_sessions";--> statement-breakpoint
ALTER TABLE "message"."call_sessions" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."call_sessions" ADD CONSTRAINT "call_sessions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
