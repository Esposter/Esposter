ALTER TABLE "app_users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."app_users" SET SCHEMA "message";
--> statement-breakpoint
ALTER TABLE "message"."webhooks" DROP CONSTRAINT "webhooks_user_id_app_users_id_fk";
--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD CONSTRAINT "webhooks_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "message"."app_users"("id") ON DELETE cascade ON UPDATE no action;