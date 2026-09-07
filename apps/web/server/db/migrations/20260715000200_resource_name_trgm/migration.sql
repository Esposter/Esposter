CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX "resources_name_trgm_index" ON "resources" USING gin ("name" gin_trgm_ops);
