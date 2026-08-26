import { createBetweenCheckSql } from "#src/models/shared/Check";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { users } from "#src/schema/users";
import { boolean, check, integer, pgEnum, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export enum VoiceInputMode {
  PushToTalk = "PushToTalk",
  VoiceActivity = "VoiceActivity",
}

const voiceInputModeSchema = z.enum(VoiceInputMode) satisfies z.ZodType<VoiceInputMode>;

export const voiceInputModeEnum = pgEnum("voiceInputMode", VoiceInputMode);

export const VoiceInputModes: readonly VoiceInputMode[] = Object.values(VoiceInputMode);

export enum NoiseSuppressionMode {
  Custom = "Custom",
  Studio = "Studio",
  VoiceIsolation = "VoiceIsolation",
}

const noiseSuppressionModeSchema = z.enum(NoiseSuppressionMode) satisfies z.ZodType<NoiseSuppressionMode>;

export const noiseSuppressionModeEnum = pgEnum("noiseSuppressionMode", NoiseSuppressionMode);

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
// The selection is a preset's path or a slot name, and neither is long. Nothing resolves an unknown value to
// Anything but "no background", so this bounds what a client can store rather than deciding what is valid.
export const MAX_VIRTUAL_BACKGROUND_LENGTH = 128;

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
    // Empty means no background, which is exactly what the picker's None entry already selects, so a value
    // That no longer resolves - a deleted slot - degrades to the same state rather than to a broken track
    virtualBackground: text().notNull().default(""),
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
        "userSettings_inputSensitivityDecibels_check",
        createBetweenCheckSql(inputSensitivityDecibels, MIN_INPUT_SENSITIVITY_DECIBELS, MAX_INPUT_SENSITIVITY_DECIBELS),
      ),
      check(
        "userSettings_microphoneVolumePercentage_check",
        createBetweenCheckSql(microphoneVolumePercentage, 0, MAX_USER_VOLUME_PERCENTAGE),
      ),
      check(
        "userSettings_speakerVolumePercentage_check",
        createBetweenCheckSql(speakerVolumePercentage, 0, MAX_USER_VOLUME_PERCENTAGE),
      ),
      check(
        "userSettings_autoIdleThresholdMs_check",
        createBetweenCheckSql(autoIdleThresholdMs, MIN_AUTO_IDLE_THRESHOLD_MS, MAX_AUTO_IDLE_THRESHOLD_MS),
      ),
      check(
        "userSettings_pushToTalkReleaseDelayMs_check",
        createBetweenCheckSql(
          pushToTalkReleaseDelayMs,
          MIN_PUSH_TO_TALK_RELEASE_DELAY_MS,
          MAX_PUSH_TO_TALK_RELEASE_DELAY_MS,
        ),
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
  virtualBackground: (schema) => schema.max(MAX_VIRTUAL_BACKGROUND_LENGTH),
  voiceInputMode: voiceInputModeSchema,
});
