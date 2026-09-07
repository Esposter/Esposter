UPDATE "message"."appUsers" SET "image" = '' WHERE "image" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."appUsers" ALTER COLUMN "image" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "message"."appUsers" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
UPDATE "message"."rooms" SET "image" = '' WHERE "image" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "image" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
UPDATE "users" SET "image" = '' WHERE "image" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "image" SET NOT NULL;
