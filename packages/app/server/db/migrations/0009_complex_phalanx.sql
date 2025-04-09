ALTER TABLE "invites" DROP CONSTRAINT "invites_roomId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "roomId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;