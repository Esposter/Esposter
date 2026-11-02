CREATE INDEX "accounts_userId_index" ON "auth"."accounts" ("userId");--> statement-breakpoint
CREATE INDEX "sessions_userId_index" ON "auth"."sessions" ("userId");--> statement-breakpoint
CREATE INDEX "invites_roomId_index" ON "message"."invites" ("roomId");--> statement-breakpoint
CREATE INDEX "roomCategories_userId_index" ON "message"."roomCategories" ("userId");--> statement-breakpoint
CREATE INDEX "roomMemberPermissions_roomId_index" ON "message"."roomMemberPermissions" ("roomId");--> statement-breakpoint
CREATE INDEX "searchHistories_userId_roomId_index" ON "message"."searchHistories" ("userId","roomId");--> statement-breakpoint
CREATE INDEX "webhooks_roomId_index" ON "message"."webhooks" ("roomId");--> statement-breakpoint
CREATE INDEX "likes_postId_index" ON "post"."likes" ("postId");--> statement-breakpoint
CREATE INDEX "resources_userId_index" ON "resource"."resources" ("userId");