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
DROP TYPE "public"."friendship_status";--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('Accepted', 'Pending');--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockedId_users_id_fk" FOREIGN KEY ("blockedId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blockerId_users_id_fk" FOREIGN KEY ("blockerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocks_blockedId_idx" ON "blocks" USING btree ("blockedId");