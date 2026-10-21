CREATE TABLE "resource"."resourceVersionAssets" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"assetHash" text,
	"channel" "resource"."snapshotChannel",
	"resourceId" uuid,
	"version" integer,
	CONSTRAINT "resourceVersionAssets_pkey" PRIMARY KEY("resourceId","channel","version","assetHash"),
	CONSTRAINT "resourceVersionAssets_assetHash_check" CHECK ("assetHash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
ALTER TABLE "resource"."resourceVersionAssets" ADD CONSTRAINT "resourceVersionAssets_VSVU2TJ5Vlmd_fkey" FOREIGN KEY ("resourceId","channel","version") REFERENCES "resource"."resourceVersions"("resourceId","channel","version") ON DELETE CASCADE;