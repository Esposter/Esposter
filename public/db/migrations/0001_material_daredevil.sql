CREATE TABLE IF NOT EXISTS "Survey" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creatorId" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"group" text,
	"model" text DEFAULT '' NOT NULL,
	"modelVersion" integer DEFAULT 0 NOT NULL,
	"publishVersion" integer DEFAULT 0 NOT NULL,
	"publishedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "Account" DROP CONSTRAINT "account_provider_provideraccountid";--> statement-breakpoint
ALTER TABLE "Like" DROP CONSTRAINT "like_userid_postid";--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP CONSTRAINT "usertoroom_userid_roomid";--> statement-breakpoint
ALTER TABLE "VerificationToken" DROP CONSTRAINT "verificationtoken_identifier_token";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Survey" ADD CONSTRAINT "Survey_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_postId_pk" PRIMARY KEY("userId","postId");--> statement-breakpoint
ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_userId_roomId_pk" PRIMARY KEY("userId","roomId");--> statement-breakpoint
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_identifier_token_pk" PRIMARY KEY("identifier","token");