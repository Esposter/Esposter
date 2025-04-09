CREATE TABLE "invites" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"code" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roomId" uuid NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "invites_code_unique" UNIQUE("code"),
	CONSTRAINT "code" CHECK (LENGTH("invites"."code") = 8)
);
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;