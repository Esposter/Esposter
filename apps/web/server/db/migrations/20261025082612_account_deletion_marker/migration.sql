ALTER TABLE "auth"."accounts" DROP CONSTRAINT "accounts_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN "deletionRequestedAt" timestamp;--> statement-breakpoint
ALTER TABLE "auth"."accounts" ADD CONSTRAINT "accounts_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE;