DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "Like";
DROP TABLE IF EXISTS "Post";
DROP TABLE IF EXISTS "RoomsOnUsers";
DROP TABLE IF EXISTS "UserToRoom";
DROP TABLE IF EXISTS "Room";
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "VerificationToken";
DROP TABLE IF EXISTS "User";

CREATE TABLE IF NOT EXISTS "Account" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"id_token" text,
	"refresh_token" text,
	"access_token" text,
	"scope" text,
	"token_type" text,
	"session_state" text,
	"expires_at" integer,
	CONSTRAINT Account_provider_providerAccountId PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Post" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creatorId" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"noLikes" integer DEFAULT 0 NOT NULL,
	"noComments" integer DEFAULT 0 NOT NULL,
	"ranking" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Room" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creatorId" uuid NOT NULL,
	"name" text NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Like" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"userId" uuid NOT NULL,
	"postId" uuid NOT NULL,
	"value" integer NOT NULL,
	CONSTRAINT Like_userId_postId PRIMARY KEY("userId","postId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserToRoom" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"userId" uuid NOT NULL,
	"roomId" uuid NOT NULL,
	CONSTRAINT UserToRoom_userId_roomId PRIMARY KEY("userId","roomId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationToken" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT VerificationToken_identifier_token PRIMARY KEY("identifier","token"),
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_Post_id_fk" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
