ALTER TABLE "Room" DROP CONSTRAINT "Room_creatorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP CONSTRAINT "UserToRoom_userId_User_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
