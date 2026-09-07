ALTER TABLE "sessions" RENAME CONSTRAINT "sessions_user_id_users_id_fk" TO "sessions_userId_users_id_fkey";--> statement-breakpoint
-- Every existing row predates the column, so there is no session to attribute it to and no value that would
-- Satisfy the foreign key below. Deleting them costs nothing: usePushSubscription resubscribes on mount, so each
-- Browser rewrites its own row, under the session it is actually signed in with, on its next authenticated load
DELETE FROM "message"."pushSubscriptions";--> statement-breakpoint
ALTER TABLE "message"."pushSubscriptions" ADD COLUMN "sessionId" text NOT NULL;--> statement-breakpoint
CREATE INDEX "pushSubscriptions_sessionId_index" ON "message"."pushSubscriptions" ("sessionId");--> statement-breakpoint
ALTER TABLE "message"."pushSubscriptions" ADD CONSTRAINT "pushSubscriptions_sessionId_sessions_id_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_users_id_fkey", ADD CONSTRAINT "sessions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;