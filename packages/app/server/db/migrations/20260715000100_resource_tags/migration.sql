ALTER TABLE "resources" ADD COLUMN "tags" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "resources_tags_index" ON "resources" USING gin ("tags");
