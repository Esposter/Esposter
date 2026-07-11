DROP TABLE "surveys";--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DELETE FROM "resources" WHERE "type" = 'Table';--> statement-breakpoint
DROP TYPE "resource_type";--> statement-breakpoint
CREATE TYPE "resource_type" AS ENUM('Dashboard', 'Email', 'File', 'Flowchart', 'Survey', 'TodoList', 'Webpage');--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE "resource_type" USING "type"::"resource_type";