CREATE TABLE "message"."users_to_huddles" (
	"roomId" uuid NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "users_to_huddles_userId_roomId_pk" PRIMARY KEY("userId","roomId")
);
--> statement-breakpoint
ALTER TABLE "message"."users_to_huddles" ADD CONSTRAINT "users_to_huddles_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message"."users_to_huddles" ADD CONSTRAINT "users_to_huddles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;