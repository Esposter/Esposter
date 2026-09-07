CREATE TABLE "resource_accesses" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"accessedAt" timestamp DEFAULT now() NOT NULL,
	"resourceId" uuid,
	"userId" text,
	CONSTRAINT "resource_accesses_pkey" PRIMARY KEY("userId","resourceId")
);
--> statement-breakpoint
CREATE INDEX "resource_accesses_userId_accessedAt_index" ON "resource_accesses" ("userId","accessedAt");--> statement-breakpoint
ALTER TABLE "resource_accesses" ADD CONSTRAINT "resource_accesses_resourceId_resources_id_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resource_accesses" ADD CONSTRAINT "resource_accesses_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;