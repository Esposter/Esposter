ALTER TABLE "Like" RENAME TO "likes";--> statement-breakpoint
ALTER TABLE "UserToRoom" RENAME TO "users_to_rooms";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "value";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "Like_postId_posts_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "Like_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP CONSTRAINT "UserToRoom_roomId_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP CONSTRAINT "UserToRoom_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "Like_userId_postId_pk";--> statement-breakpoint
ALTER TABLE "users_to_rooms" DROP CONSTRAINT "UserToRoom_userId_roomId_pk";--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_postId_pk" PRIMARY KEY("userId","postId");--> statement-breakpoint
ALTER TABLE "users_to_rooms" ADD CONSTRAINT "users_to_rooms_userId_roomId_pk" PRIMARY KEY("userId","roomId");--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_rooms" ADD CONSTRAINT "users_to_rooms_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_rooms" ADD CONSTRAINT "users_to_rooms_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "value" CHECK ("likes"."value" = 1 OR "likes"."value" = -1);