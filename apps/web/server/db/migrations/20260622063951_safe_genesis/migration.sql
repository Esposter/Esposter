CREATE TYPE "noise_suppression_mode" AS ENUM('Custom', 'Studio', 'VoiceIsolation');--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD COLUMN "microphoneVolumePercentage" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD COLUMN "noiseSuppressionMode" "noise_suppression_mode" DEFAULT 'Custom'::"noise_suppression_mode" NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD COLUMN "speakerVolumePercentage" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD CONSTRAINT "user_settings_microphone_volume_percentage_check" CHECK ("microphoneVolumePercentage" BETWEEN 0 AND 200);--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD CONSTRAINT "user_settings_speaker_volume_percentage_check" CHECK ("speakerVolumePercentage" BETWEEN 0 AND 200);