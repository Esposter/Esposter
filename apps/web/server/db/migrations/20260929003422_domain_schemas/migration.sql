CREATE SCHEMA "achievement";
--> statement-breakpoint
CREATE SCHEMA "app";
--> statement-breakpoint
CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "notification";
--> statement-breakpoint
CREATE SCHEMA "post";
--> statement-breakpoint
CREATE SCHEMA "resource";
--> statement-breakpoint
CREATE SCHEMA "social";
--> statement-breakpoint
CREATE SCHEMA "storage";
--> statement-breakpoint
ALTER TYPE "achievementName" SET SCHEMA "achievement";--> statement-breakpoint
ALTER TYPE "storageTier" SET SCHEMA "auth";--> statement-breakpoint
ALTER TYPE "wordFilterAction" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "mimeCategory" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "roomType" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "noiseSuppressionMode" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "voiceInputMode" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "userStatus" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "notificationType" SET SCHEMA "message";--> statement-breakpoint
ALTER TYPE "appNotificationType" SET SCHEMA "notification";--> statement-breakpoint
ALTER TYPE "notificationSeverity" SET SCHEMA "notification";--> statement-breakpoint
ALTER TYPE "resourceType" SET SCHEMA "resource";--> statement-breakpoint
ALTER TYPE "snapshotChannel" SET SCHEMA "resource";--> statement-breakpoint
ALTER TYPE "snapshotReason" SET SCHEMA "resource";--> statement-breakpoint
ALTER TYPE "azureContainer" SET SCHEMA "storage";--> statement-breakpoint
ALTER TABLE "achievements" SET SCHEMA "achievement";
--> statement-breakpoint
ALTER TABLE "userAchievements" SET SCHEMA "achievement";
--> statement-breakpoint
ALTER TABLE "bookmarks" SET SCHEMA "app";
--> statement-breakpoint
ALTER TABLE "rateLimiterFlexible" SET SCHEMA "app";
--> statement-breakpoint
ALTER TABLE "accounts" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "sessions" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "users" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "verifications" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "notifications" SET SCHEMA "notification";
--> statement-breakpoint
ALTER TABLE "pushSubscriptions" SET SCHEMA "notification";
--> statement-breakpoint
ALTER TABLE "likes" SET SCHEMA "post";
--> statement-breakpoint
ALTER TABLE "posts" SET SCHEMA "post";
--> statement-breakpoint
ALTER TABLE "resourceAccesses" SET SCHEMA "resource";
--> statement-breakpoint
ALTER TABLE "resourceFavorites" SET SCHEMA "resource";
--> statement-breakpoint
ALTER TABLE "resourcePublications" SET SCHEMA "resource";
--> statement-breakpoint
ALTER TABLE "resources" SET SCHEMA "resource";
--> statement-breakpoint
ALTER TABLE "resourceVersions" SET SCHEMA "resource";
--> statement-breakpoint
ALTER TABLE "blocks" SET SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "friendRequests" SET SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "friends" SET SCHEMA "social";
--> statement-breakpoint
ALTER TABLE "storageLedger" SET SCHEMA "storage";
