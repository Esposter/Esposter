ALTER TABLE "search_history" DROP CONSTRAINT "query";--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "query" CHECK (LENGTH("search_history"."query") <= 10000);