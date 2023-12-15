ALTER TABLE "Post" ALTER COLUMN "parentId" SET DATA TYPE uuid USING (gen_random_uuid());--> statement-breakpoint
ALTER TABLE "Survey" ALTER COLUMN "name" DROP DEFAULT;