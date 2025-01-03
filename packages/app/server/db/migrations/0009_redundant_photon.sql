ALTER TABLE "Account" RENAME TO "accounts";--> statement-breakpoint
ALTER TABLE "Post" RENAME TO "posts";--> statement-breakpoint
ALTER TABLE "Room" RENAME TO "rooms";--> statement-breakpoint
ALTER TABLE "Session" RENAME TO "sessions";--> statement-breakpoint
ALTER TABLE "Survey" RENAME TO "surveys";--> statement-breakpoint
ALTER TABLE "User" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "Verification" RENAME TO "verifications";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "Session_token_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "User_email_unique";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "title";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "description";--> statement-breakpoint
ALTER TABLE "rooms" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "surveys" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "Account_user_id_User_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "Post_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "rooms" DROP CONSTRAINT "Room_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "Session_user_id_User_id_fk";
--> statement-breakpoint
ALTER TABLE "surveys" DROP CONSTRAINT "Survey_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_Post_id_fk";
--> statement-breakpoint
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP CONSTRAINT "UserToRoom_roomId_Room_id_fk";
--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP CONSTRAINT "UserToRoom_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "title" CHECK (LENGTH("posts"."title") >= 1 AND LENGTH("posts"."title") <= $1);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "description" CHECK (LENGTH("posts"."description") <= $1);--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "name" CHECK (LENGTH("rooms"."name") >= 1 AND LENGTH("rooms"."name") <= $1);--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "name" CHECK (LENGTH("surveys"."name") >= 1 AND LENGTH("surveys"."name") <= $1);