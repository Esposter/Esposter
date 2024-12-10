ALTER TABLE "Post" ADD CONSTRAINT "title" CHECK (LENGTH("Post"."title") >= 1 AND LENGTH("Post"."title") <= $1);--> statement-breakpoint
ALTER TABLE "Post" ADD CONSTRAINT "description" CHECK (LENGTH("Post"."description") <= $1);--> statement-breakpoint
ALTER TABLE "Room" ADD CONSTRAINT "name" CHECK (LENGTH("Room"."name") >= 1 AND LENGTH("Room"."name") <= $1);--> statement-breakpoint
ALTER TABLE "Survey" ADD CONSTRAINT "name" CHECK (LENGTH("Survey"."name") >= 1 AND LENGTH("Survey"."name") <= $1);