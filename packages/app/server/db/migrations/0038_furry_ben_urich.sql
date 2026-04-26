CREATE TABLE "blocks" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"blockedId" text NOT NULL,
	"blockerId" text NOT NULL,
	CONSTRAINT "blocks_blockerId_blockedId_pk" PRIMARY KEY("blockerId","blockedId"),
	CONSTRAINT "no_self_block" CHECK ("blocks"."blockerId" != "blocks"."blockedId")
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"receiverId" text NOT NULL,
	"senderId" text NOT NULL,
	CONSTRAINT "no_self_friend_request" CHECK ("friend_requests"."senderId" != "friend_requests"."receiverId")
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockedId_users_id_fk" FOREIGN KEY ("blockedId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockerId_users_id_fk" FOREIGN KEY ("blockerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocks_blockedId_idx" ON "blocks" USING btree ("blockedId");--> statement-breakpoint
CREATE INDEX "friend_requests_receiverId_idx" ON "friend_requests" USING btree ("receiverId");--> statement-breakpoint
CREATE INDEX "friend_requests_senderId_idx" ON "friend_requests" USING btree ("senderId");--> statement-breakpoint
ALTER TABLE "friends" DROP COLUMN "status";--> statement-breakpoint
DROP TYPE "public"."friendship_status";