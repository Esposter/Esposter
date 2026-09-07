CREATE TYPE "public"."achievement_name" AS ENUM('CenturyClub', 'ConversationKeeper', 'EssayWriter', 'FileSharer', 'FirstMessage', 'MessageForwarder', 'MessageMaster', 'Meta', 'NightOwl', 'PinCollector', 'ProlificPoster', 'RoomCreator', 'SecondThoughts', 'Socialite');--> statement-breakpoint
CREATE TABLE "achievements" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "achievement_name" NOT NULL,
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"achievement_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unlocked_at" timestamp,
	"user_id" text NOT NULL,
	CONSTRAINT "amount" CHECK ("user_achievements"."amount" >= 1)
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_index" ON "user_achievements" USING btree ("user_id","achievement_id");