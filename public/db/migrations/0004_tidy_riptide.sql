ALTER TABLE "Post" ALTER COLUMN "parentId" SET DATA TYPE uuid USING (gen_random_uuid());--> statement-breakpoint
UPDATE "Post" SET "parentId" = NULL;--> statement-breakpoint
ALTER TABLE "Survey" ALTER COLUMN "name" DROP DEFAULT;