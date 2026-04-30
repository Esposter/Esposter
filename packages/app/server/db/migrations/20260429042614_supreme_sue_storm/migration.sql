ALTER TABLE "message"."rooms" ALTER COLUMN "topic" SET DEFAULT '';--> statement-breakpoint
UPDATE "message"."rooms" SET "topic" = '' WHERE "topic" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "topic" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "surveys" ALTER COLUMN "group" SET DEFAULT '';--> statement-breakpoint
UPDATE "surveys" SET "group" = '' WHERE "group" IS NULL;--> statement-breakpoint
ALTER TABLE "surveys" ALTER COLUMN "group" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "rooms_topic_length_check" CHECK (LENGTH("topic") <= 500);--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_group_length_check" CHECK (LENGTH("group") <= 100);