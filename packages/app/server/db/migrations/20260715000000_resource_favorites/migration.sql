CREATE TABLE "resource_favorites" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"resourceId" uuid NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "resource_favorites_userId_resourceId_pk" PRIMARY KEY("userId","resourceId")
);
--> statement-breakpoint
ALTER TABLE "resource_favorites" ADD CONSTRAINT "resource_favorites_resourceId_resources_id_fk" FOREIGN KEY ("resourceId") REFERENCES "public"."resources"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resource_favorites" ADD CONSTRAINT "resource_favorites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE;
