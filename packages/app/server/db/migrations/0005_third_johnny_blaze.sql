ALTER TABLE "Authenticator" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "Authenticator" CASCADE;--> statement-breakpoint
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey";--> statement-breakpoint
ALTER TABLE "Account" RENAME TO "accounts";--> statement-breakpoint
ALTER TABLE "Post" RENAME TO "posts";--> statement-breakpoint
ALTER TABLE "Room" RENAME TO "rooms";--> statement-breakpoint
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey";--> statement-breakpoint
ALTER TABLE "Session" RENAME TO "sessions";--> statement-breakpoint
ALTER TABLE "Survey" RENAME TO "surveys";--> statement-breakpoint
ALTER TABLE "Like" RENAME TO "likes";--> statement-breakpoint
ALTER TABLE "User" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "UserToRoom" RENAME TO "users_to_rooms";--> statement-breakpoint
ALTER TABLE "VerificationToken" RENAME TO "verifications";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "expires_at" TO "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "providerAccountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "expires" TO "expires_at";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "sessionToken" TO "token";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "expires" TO "expires_at";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "verifications" RENAME COLUMN "token" TO "value";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "User_email_unique";--> statement-breakpoint
ALTER TABLE "verifications" DROP CONSTRAINT "VerificationToken_token_unique";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "value";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "Account_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "Post_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "rooms" DROP CONSTRAINT "Room_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "Session_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "surveys" DROP CONSTRAINT "Survey_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "Like_postId_Post_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "Like_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP CONSTRAINT "UserToRoom_roomId_Room_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP CONSTRAINT "UserToRoom_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "Account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "Like_userId_postId_pk";--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP CONSTRAINT "UserToRoom_userId_roomId_pk";--> statement-breakpoint
ALTER TABLE "verifications" DROP CONSTRAINT "VerificationToken_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp USING NULL
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email_verified" TYPE boolean USING (CASE WHEN email_verified IS NULL THEN false ELSE true END)
ALTER TABLE "posts" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "surveys" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_rooms" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_postId_pk" PRIMARY KEY("userId","postId");--> statement-breakpoint
ALTER TABLE "users_to_rooms" ADD CONSTRAINT "users_to_rooms_userId_roomId_pk" PRIMARY KEY("userId","roomId");--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "provider_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "verifications" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_rooms" ADD CONSTRAINT "users_to_rooms_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_rooms" ADD CONSTRAINT "users_to_rooms_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "session_state";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "token_type";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "likes" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "title" CHECK (LENGTH("posts"."title") >= 1 AND LENGTH("posts"."title") <= 300);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "description" CHECK (LENGTH("posts"."description") <= 1000);--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "name" CHECK (LENGTH("rooms"."name") >= 1 AND LENGTH("rooms"."name") <= 100);--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "name" CHECK (LENGTH("surveys"."name") >= 1 AND LENGTH("surveys"."name") <= 100);--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "value" CHECK ("likes"."value" = 1 OR "likes"."value" = -1);