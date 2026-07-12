import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { boolean, check, integer, pgEnum, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export enum VoiceInputMode {
  PushToTalk = "PushToTalk",
  VoiceActivity = "VoiceActivity",
}

const voiceInputModeSchema = z.enum(VoiceInputMode) satisfies z.ZodType<VoiceInputMode>;

export const voiceInputModeEnum = pgEnum("voice_input_mode", VoiceInputMode);

export enum NoiseSuppressionMode {
  Custom = "Custom",
  Studio = "Studio",
  VoiceIsolation = "VoiceIsolation",
}

const noiseSuppressionModeSchema = z.enum(NoiseSuppressionMode) satisfies z.ZodType<NoiseSuppressionMode>;

export const noiseSuppressionModeEnum = pgEnum("noise_suppression_mode", NoiseSuppressionMode);

export const MIN_INPUT_SENSITIVITY_DECIBELS = -100;
export const MAX_INPUT_SENSITIVITY_DECIBELS = 0;
export const DEFAULT_INPUT_SENSITIVITY_DECIBELS = -50;
export const MAX_USER_VOLUME_PERCENTAGE = 200;
export const DEFAULT_MICROPHONE_VOLUME_PERCENTAGE = 100;
export const DEFAULT_SPEAKER_VOLUME_PERCENTAGE = 100;
export const MIN_AUTO_IDLE_THRESHOLD_MS = 60_000;
export const MAX_AUTO_IDLE_THRESHOLD_MS = 86_400_000;
export const DEFAULT_AUTO_IDLE_THRESHOLD_MS = 600_000;
export const MIN_PUSH_TO_TALK_RELEASE_DELAY_MS = 0;
export const MAX_PUSH_TO_TALK_RELEASE_DELAY_MS = 2000;
export const DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS = 20;

export const userSettingsInMessage = pgTable(
  "userSettings",
  {
    autoIdleThresholdMs: integer().notNull().default(DEFAULT_AUTO_IDLE_THRESHOLD_MS),
    inputSensitivityDecibels: integer().notNull().default(DEFAULT_INPUT_SENSITIVITY_DECIBELS),
    isDeafenOnJoin: boolean().notNull().default(false),
    isMuteOnJoin: boolean().notNull().default(false),
    microphoneVolumePercentage: integer().notNull().default(DEFAULT_MICROPHONE_VOLUME_PERCENTAGE),
    noiseSuppressionMode: noiseSuppressionModeEnum().notNull().default(NoiseSuppressionMode.Custom),
    pushToTalkKeybind: text().notNull().default(""),
    pushToTalkReleaseDelayMs: integer().notNull().default(DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS),
    speakerVolumePercentage: integer().notNull().default(DEFAULT_SPEAKER_VOLUME_PERCENTAGE),
    userId: text()
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    voiceInputMode: voiceInputModeEnum().notNull().default(VoiceInputMode.VoiceActivity),
  },
  {
    extraConfig: ({
      autoIdleThresholdMs,
      inputSensitivityDecibels,
      microphoneVolumePercentage,
      pushToTalkReleaseDelayMs,
      speakerVolumePercentage,
    }) => [
      check(
        "user_settings_input_sensitivity_decibels_check",
        sql`${inputSensitivityDecibels} BETWEEN ${sql.raw(MIN_INPUT_SENSITIVITY_DECIBELS.toString())} AND ${sql.raw(MAX_INPUT_SENSITIVITY_DECIBELS.toString())}`,
      ),
      check(
        "user_settings_microphone_volume_percentage_check",
        sql`${microphoneVolumePercentage} BETWEEN 0 AND ${sql.raw(MAX_USER_VOLUME_PERCENTAGE.toString())}`,
      ),
      check(
        "user_settings_speaker_volume_percentage_check",
        sql`${speakerVolumePercentage} BETWEEN 0 AND ${sql.raw(MAX_USER_VOLUME_PERCENTAGE.toString())}`,
      ),
      check(
        "user_settings_auto_idle_threshold_ms_check",
        sql`${autoIdleThresholdMs} BETWEEN ${sql.raw(MIN_AUTO_IDLE_THRESHOLD_MS.toString())} AND ${sql.raw(MAX_AUTO_IDLE_THRESHOLD_MS.toString())}`,
      ),
      check(
        "user_settings_push_to_talk_release_delay_ms_check",
        sql`${pushToTalkReleaseDelayMs} BETWEEN ${sql.raw(MIN_PUSH_TO_TALK_RELEASE_DELAY_MS.toString())} AND ${sql.raw(MAX_PUSH_TO_TALK_RELEASE_DELAY_MS.toString())}`,
      ),
    ],
    schema: messageSchema,
  },
);
export type UserSettingsInMessage = typeof userSettingsInMessage.$inferSelect;

export const selectUserSettingsInMessageSchema = createSelectSchema(userSettingsInMessage, {
  autoIdleThresholdMs: (schema) => schema.min(MIN_AUTO_IDLE_THRESHOLD_MS).max(MAX_AUTO_IDLE_THRESHOLD_MS),
  inputSensitivityDecibels: (schema) => schema.min(MIN_INPUT_SENSITIVITY_DECIBELS).max(MAX_INPUT_SENSITIVITY_DECIBELS),
  microphoneVolumePercentage: (schema) => schema.min(0).max(MAX_USER_VOLUME_PERCENTAGE),
  noiseSuppressionMode: noiseSuppressionModeSchema,
  pushToTalkReleaseDelayMs: (schema) =>
    schema.min(MIN_PUSH_TO_TALK_RELEASE_DELAY_MS).max(MAX_PUSH_TO_TALK_RELEASE_DELAY_MS),
  speakerVolumePercentage: (schema) => schema.min(0).max(MAX_USER_VOLUME_PERCENTAGE),
  voiceInputMode: voiceInputModeSchema,
});
