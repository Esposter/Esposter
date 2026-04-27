ALTER TABLE "users" ADD COLUMN "biography" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "biography" CHECK ("users"."biography" IS NULL OR LENGTH("users"."biography") <= 160);