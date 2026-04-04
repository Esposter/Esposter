CREATE TYPE "public"."friendship_status" AS ENUM('Accepted', 'Blocked', 'Pending');--> statement-breakpoint
CREATE TABLE "friends" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"receiverId" text NOT NULL,
	"senderId" text NOT NULL,
	"status" "friendship_status" DEFAULT 'Pending' NOT NULL,
	CONSTRAINT "no_self_friendship" CHECK ("friends"."senderId" != "friends"."receiverId")
);
--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;