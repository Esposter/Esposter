ALTER TABLE "message"."rooms" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "name" CHECK (LENGTH("message"."rooms"."name") <= 100);