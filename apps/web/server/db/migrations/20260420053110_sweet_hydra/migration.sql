ALTER TABLE "message"."app_users" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."room_categories" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."room_roles" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."rooms" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "surveys" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."app_users" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("message"."app_users"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."room_categories" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("message"."room_categories"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."room_roles" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("message"."room_roles"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("message"."rooms"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("surveys"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("users"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD CONSTRAINT "name" CHECK (LENGTH(TRIM("message"."webhooks"."name")) BETWEEN 1 AND 100);