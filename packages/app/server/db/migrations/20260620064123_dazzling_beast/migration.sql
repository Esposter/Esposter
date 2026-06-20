CREATE TYPE "voice_input_mode" AS ENUM('PushToTalk', 'VoiceActivity');--> statement-breakpoint
CREATE TABLE "message"."userSettings" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"autoIdleThresholdMs" integer DEFAULT 600000 NOT NULL,
	"defaultUserVolumePercentage" integer DEFAULT 100 NOT NULL,
	"inputSensitivityDecibels" integer DEFAULT -50 NOT NULL,
	"isDeafenOnJoin" boolean DEFAULT false NOT NULL,
	"isMuteOnJoin" boolean DEFAULT false NOT NULL,
	"pushToTalkKeybind" text DEFAULT '' NOT NULL,
	"userId" text PRIMARY KEY,
	"voiceInputMode" "voice_input_mode" DEFAULT 'VoiceActivity'::"voice_input_mode" NOT NULL,
	CONSTRAINT "user_settings_input_sensitivity_decibels_check" CHECK ("inputSensitivityDecibels" BETWEEN -100 AND 0),
	CONSTRAINT "user_settings_default_user_volume_percentage_check" CHECK ("defaultUserVolumePercentage" BETWEEN 0 AND 200),
	CONSTRAINT "user_settings_auto_idle_threshold_ms_check" CHECK ("autoIdleThresholdMs" BETWEEN 60000 AND 86400000)
);
--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD CONSTRAINT "userSettings_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;