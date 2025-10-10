CREATE TABLE "app_users" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text,
	"name" text NOT NULL,
	CONSTRAINT "name" CHECK (LENGTH("app_users"."name") >= 1 AND LENGTH("app_users"."name") <= 100)
);
--> statement-breakpoint
ALTER TABLE "message"."search_history" RENAME TO "search_histories";--> statement-breakpoint
ALTER TABLE "message"."webhooks" DROP CONSTRAINT "webhooks_user_id_unique";--> statement-breakpoint
ALTER TABLE "message"."search_histories" DROP CONSTRAINT "query";--> statement-breakpoint
ALTER TABLE "message"."search_histories" DROP CONSTRAINT "search_history_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "message"."search_histories" DROP CONSTRAINT "search_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "message"."webhooks" DROP CONSTRAINT "webhooks_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "message"."search_histories" ADD CONSTRAINT "search_histories_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "message"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."search_histories" ADD CONSTRAINT "search_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD CONSTRAINT "webhooks_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "message"."search_histories" ADD CONSTRAINT "query" CHECK (LENGTH("message"."search_histories"."query") <= 10000);--> statement-breakpoint
DROP TYPE "public"."user_type";