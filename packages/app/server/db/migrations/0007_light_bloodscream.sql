ALTER TABLE "posts" DROP CONSTRAINT "title";--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "title" CHECK (LENGTH("posts"."title") >= 1 AND LENGTH("posts"."title") <= 300);