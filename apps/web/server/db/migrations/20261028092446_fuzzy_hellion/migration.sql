ALTER TABLE "storage"."storageLedger" ALTER COLUMN "containerName" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "storage"."azureContainer";--> statement-breakpoint
CREATE TYPE "storage"."azureContainer" AS ENUM('clicker-assets', 'deadletter', 'genshin-assets', 'message-assets', 'public-app-assets', 'public-dungeons-assets', 'public-genshin-assets', 'public-user-assets', 'resource-assets', 'user-assets');--> statement-breakpoint
ALTER TABLE "storage"."storageLedger" ALTER COLUMN "containerName" SET DATA TYPE "storage"."azureContainer" USING "containerName"::"storage"."azureContainer";