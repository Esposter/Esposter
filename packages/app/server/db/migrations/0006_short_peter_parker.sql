ALTER TABLE "Authenticator" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Authenticator" CASCADE;--> statement-breakpoint
ALTER TABLE "VerificationToken" RENAME TO "Verification";--> statement-breakpoint
ALTER TABLE "Account" RENAME COLUMN "expires_at" TO "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "Account" RENAME COLUMN "providerAccountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "Account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "Session" RENAME COLUMN "expires" TO "expires_at";--> statement-breakpoint
ALTER TABLE "Session" RENAME COLUMN "sessionToken" TO "token";--> statement-breakpoint
ALTER TABLE "Session" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "User" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "Verification" RENAME COLUMN "expires" TO "expires_at";--> statement-breakpoint
ALTER TABLE "Verification" RENAME COLUMN "token" TO "value";--> statement-breakpoint
ALTER TABLE "Verification" DROP CONSTRAINT "VerificationToken_token_unique";--> statement-breakpoint
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Account" DROP CONSTRAINT "Account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "Verification" DROP CONSTRAINT "VerificationToken_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Account" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "Account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "Account" ADD COLUMN "provider_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "Account" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "Session" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "Session" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "Session" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "Verification" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Account" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "Account" DROP COLUMN "session_state";--> statement-breakpoint
ALTER TABLE "Account" DROP COLUMN "token_type";--> statement-breakpoint
ALTER TABLE "Account" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_token_unique" UNIQUE("token");