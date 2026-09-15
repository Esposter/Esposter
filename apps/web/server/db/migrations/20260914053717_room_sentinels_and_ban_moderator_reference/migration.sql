ALTER TABLE "message"."rooms" DROP CONSTRAINT "rooms_maxFileSizeBytes_check", ADD CONSTRAINT "rooms_maxFileSizeBytes_check" CHECK ("maxFileSizeBytes" >= 0);--> statement-breakpoint
ALTER TABLE "message"."rooms" DROP CONSTRAINT "rooms_slowmodeMs_check", ADD CONSTRAINT "rooms_slowmodeMs_check" CHECK ("slowmodeMs" >= 0);--> statement-breakpoint
UPDATE "message"."rooms" SET "maxFileSizeBytes" = 0 WHERE "maxFileSizeBytes" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "maxFileSizeBytes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "maxFileSizeBytes" SET NOT NULL;--> statement-breakpoint
UPDATE "message"."rooms" SET "slowmodeMs" = 0 WHERE "slowmodeMs" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "slowmodeMs" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "slowmodeMs" SET NOT NULL;--> statement-breakpoint
UPDATE "message"."bans" SET "bannedByUserId" = NULL WHERE "bannedByUserId" IS NOT NULL AND "bannedByUserId" NOT IN (SELECT "id" FROM "users");--> statement-breakpoint
ALTER TABLE "message"."bans" ADD CONSTRAINT "bans_bannedByUserId_users_id_fkey" FOREIGN KEY ("bannedByUserId") REFERENCES "users"("id") ON DELETE SET NULL;
