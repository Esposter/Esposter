CREATE TABLE IF NOT EXISTS "Authenticator" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"counter" integer NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialID" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"transports" text,
	"userId" uuid NOT NULL,
	CONSTRAINT "Authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "Authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
ALTER TABLE "Post" RENAME COLUMN "creatorId" TO "userId";--> statement-breakpoint
ALTER TABLE "Room" RENAME COLUMN "creatorId" TO "userId";--> statement-breakpoint
ALTER TABLE "Survey" RENAME COLUMN "creatorId" TO "userId";--> statement-breakpoint
ALTER TABLE "Post" DROP CONSTRAINT "Post_creatorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Room" DROP CONSTRAINT "Room_creatorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Survey" DROP CONSTRAINT "Survey_creatorId_User_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Survey" ADD CONSTRAINT "Survey_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
