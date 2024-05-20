ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Post" DROP CONSTRAINT "Post_creatorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Room" DROP CONSTRAINT "Room_creatorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Survey" DROP CONSTRAINT "Survey_creatorId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP CONSTRAINT "UserToRoom_userId_User_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Post" ADD CONSTRAINT "Post_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Survey" ADD CONSTRAINT "Survey_creatorId_User_id_fk" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserToRoom" ADD CONSTRAINT "UserToRoom_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
