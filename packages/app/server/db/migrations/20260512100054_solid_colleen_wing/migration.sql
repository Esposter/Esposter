CREATE TABLE "message"."call_sessions" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" text PRIMARY KEY,
	"roomId" uuid,
	CONSTRAINT "call_sessions_id_length_check" CHECK (LENGTH("id") = 12)
);
--> statement-breakpoint
ALTER TABLE "message"."invites" RENAME COLUMN "code" TO "token";--> statement-breakpoint
ALTER TABLE "message"."invites" RENAME CONSTRAINT "invites_code_length_check" TO "invites_token_length_check";--> statement-breakpoint
ALTER TABLE "message"."call_sessions" ADD CONSTRAINT "call_sessions_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."invites" DROP CONSTRAINT "invites_token_length_check", ADD CONSTRAINT "invites_token_length_check" CHECK (LENGTH("token") = 8);