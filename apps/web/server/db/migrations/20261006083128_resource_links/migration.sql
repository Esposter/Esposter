CREATE TYPE "resource"."resourceLinkType" AS ENUM('Dataset', 'Email', 'Survey');--> statement-breakpoint
CREATE TABLE "resource"."resourceLinks" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"sourceId" uuid,
	"targetId" uuid,
	"type" "resource"."resourceLinkType",
	CONSTRAINT "resourceLinks_pkey" PRIMARY KEY("sourceId","type","targetId")
);
--> statement-breakpoint
-- The one link the dropped column held, carried over before the drop so a Program never stops authorizing the
-- Tokens it issued. Every other link is projected from content by a save, and by the one-off blob backfill
INSERT INTO "resource"."resourceLinks" ("sourceId", "targetId", "type", "updatedAt")
SELECT "id", "boundResourceId", 'Survey', now() FROM "resource"."resources" WHERE "boundResourceId" IS NOT NULL;--> statement-breakpoint
DROP INDEX "resource"."resources_bound_resource_index";--> statement-breakpoint
ALTER TABLE "resource"."resources" DROP COLUMN "boundResourceId";--> statement-breakpoint
CREATE INDEX "resourceLinks_target_index" ON "resource"."resourceLinks" ("targetId","type");--> statement-breakpoint
ALTER TABLE "resource"."resourceLinks" ADD CONSTRAINT "resourceLinks_sourceId_resources_id_fkey" FOREIGN KEY ("sourceId") REFERENCES "resource"."resources"("id") ON DELETE CASCADE;