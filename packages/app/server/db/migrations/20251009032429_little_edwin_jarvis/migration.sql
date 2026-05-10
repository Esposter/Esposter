CREATE TYPE "public"."user_type" AS ENUM('App', 'Human');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ALTER COLUMN "user_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "type" "user_type" DEFAULT 'Human' NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD COLUMN "creator_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD CONSTRAINT "webhooks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD CONSTRAINT "webhooks_user_id_unique" UNIQUE("user_id");