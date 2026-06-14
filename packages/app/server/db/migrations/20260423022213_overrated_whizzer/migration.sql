CREATE TABLE "message"."bans" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"bannedByUserId" text,
	"roomId" uuid NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "bans_roomId_userId_pk" PRIMARY KEY("roomId","userId")
);
--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" ADD COLUMN "timeoutUntil" timestamp;--> statement-breakpoint
ALTER TABLE "message"."bans" ADD CONSTRAINT "bans_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."bans" ADD CONSTRAINT "bans_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;