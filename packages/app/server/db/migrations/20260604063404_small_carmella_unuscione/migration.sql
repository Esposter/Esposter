UPDATE "message"."rooms" SET "name" = '' WHERE "name" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "name" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
-- Two-branch check instead of BETWEEN 0 AND 100: explicitly documents that empty names are intentional (DM rooms)
-- and non-empty names must be valid (1-maxLength after trim), keeping the two distinct cases readable.
ALTER TABLE "message"."rooms" DROP CONSTRAINT "rooms_name_check", ADD CONSTRAINT "rooms_name_check" CHECK (LENGTH(TRIM("name")) = 0 OR LENGTH(TRIM("name")) BETWEEN 1 AND 100);
