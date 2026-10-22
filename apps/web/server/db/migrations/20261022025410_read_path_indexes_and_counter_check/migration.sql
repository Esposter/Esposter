DROP INDEX "message"."usersToRoomRoles_roomId_index";--> statement-breakpoint
CREATE INDEX "usersToRoomRoles_roomId_userId_index" ON "message"."usersToRoomRoles" ("roomId","userId");--> statement-breakpoint
CREATE INDEX "usersToRooms_roomId_index" ON "message"."usersToRooms" ("roomId");--> statement-breakpoint
CREATE INDEX "posts_userId_ranking_index" ON "post"."posts" ("userId","ranking" DESC,"id" DESC);--> statement-breakpoint
ALTER TABLE "post"."posts" ADD CONSTRAINT "posts_commentCount_check" CHECK ("commentCount" >= 0);