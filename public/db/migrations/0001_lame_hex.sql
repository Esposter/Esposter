ALTER TABLE "UserToRoom" DROP CONSTRAINT "UserToRoom_roomId_Room_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_roomId_Room_id_fk" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
