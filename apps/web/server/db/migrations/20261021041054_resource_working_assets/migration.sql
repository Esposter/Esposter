CREATE TABLE "resource"."resourceWorkingAssets" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"assetHash" text,
	"resourceId" uuid,
	CONSTRAINT "resourceWorkingAssets_pkey" PRIMARY KEY("resourceId","assetHash"),
	CONSTRAINT "resourceWorkingAssets_assetHash_check" CHECK ("assetHash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
ALTER TABLE "resource"."resourceWorkingAssets" ADD CONSTRAINT "resourceWorkingAssets_resourceId_resources_id_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"."resources"("id") ON DELETE CASCADE;