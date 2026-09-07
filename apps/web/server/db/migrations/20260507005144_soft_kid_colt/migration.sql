ALTER TABLE "message"."app_users" RENAME TO "appUsers";--> statement-breakpoint
ALTER TABLE "friend_requests" RENAME TO "friendRequests";--> statement-breakpoint
ALTER TABLE "message"."push_subscriptions" RENAME TO "pushSubscriptions";--> statement-breakpoint
ALTER TABLE "rate_limiter_flexible" RENAME TO "rateLimiterFlexible";--> statement-breakpoint
ALTER TABLE "message"."room_categories" RENAME TO "roomCategories";--> statement-breakpoint
ALTER TABLE "message"."room_roles" RENAME TO "roomRoles";--> statement-breakpoint
ALTER TABLE "message"."search_histories" RENAME TO "searchHistories";--> statement-breakpoint
ALTER TABLE "user_achievements" RENAME TO "userAchievements";--> statement-breakpoint
ALTER TABLE "message"."user_statuses" RENAME TO "userStatuses";--> statement-breakpoint
ALTER TABLE "message"."users_to_room_roles" RENAME TO "usersToRoomRoles";--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" RENAME TO "usersToRooms";