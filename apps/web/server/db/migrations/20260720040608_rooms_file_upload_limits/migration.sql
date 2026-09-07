CREATE TYPE "mime_category" AS ENUM('Audio', 'Document', 'Image', 'Video');--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "allowedMimeCategories" "mime_category"[] DEFAULT '{Audio,Document,Image,Video}'::"mime_category"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "maxFileSizeBytes" integer;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "rooms_max_file_size_bytes_check" CHECK ("maxFileSizeBytes" IS NULL OR "maxFileSizeBytes" >= 1);