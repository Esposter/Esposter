UPDATE "message"."room_roles" SET "color" = '' WHERE "color" IS NULL;--> statement-breakpoint
ALTER TABLE "message"."room_roles" ALTER COLUMN "color" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "message"."room_roles" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
UPDATE "users" SET "biography" = '' WHERE "biography" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "biography" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "biography" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_biography_length_check", ADD CONSTRAINT "users_biography_length_check" CHECK (LENGTH("biography") <= 160);
