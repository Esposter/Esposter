import {
  NoiseSuppressionMode,
  noiseSuppressionModeSchema,
} from "#src/models/message/userSettings/NoiseSuppressionMode";
import { VoiceInputMode, voiceInputModeSchema } from "#src/models/message/userSettings/VoiceInputMode";
import { pgTable } from "#src/pgTable";
import { messageSchema } from "#src/schema/messageSchema";
import { users } from "#src/schema/users";
import {
  DEFAULT_AUTO_IDLE_THRESHOLD_MS,
  DEFAULT_INPUT_SENSITIVITY_DECIBELS,
  DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  MAX_AUTO_IDLE_THRESHOLD_MS,
  MAX_INPUT_SENSITIVITY_DECIBELS,
  MAX_PUSH_TO_TALK_KEYBIND_LENGTH,
  MAX_PUSH_TO_TALK_RELEASE_DELAY_MS,
  MAX_USER_VOLUME_PERCENTAGE,
  MAX_VIRTUAL_BACKGROUND_LENGTH,
  MIN_AUTO_IDLE_THRESHOLD_MS,
  MIN_INPUT_SENSITIVITY_DECIBELS,
  MIN_PUSH_TO_TALK_RELEASE_DELAY_MS,
} from "#src/services/message/userSettings/constants";
import { createBetweenCheckSql } from "#src/services/shared/createBetweenCheckSql";
import { createMaxLengthCheckSql } from "#src/services/shared/createMaxLengthCheckSql";
import { boolean, check, integer, pgEnum, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const voiceInputModeEnum = pgEnum("voiceInputMode", VoiceInputMode);

export const noiseSuppressionModeEnum = pgEnum("noiseSuppressionMode", NoiseSuppressionMode);

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
      pushToTalkKeybind,
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
        "userSettings_pushToTalkKeybind_length_check",
        createMaxLengthCheckSql(pushToTalkKeybind, MAX_PUSH_TO_TALK_KEYBIND_LENGTH),
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
  pushToTalkKeybind: (schema) => schema.max(MAX_PUSH_TO_TALK_KEYBIND_LENGTH),
  pushToTalkReleaseDelayMs: (schema) =>
    schema.min(MIN_PUSH_TO_TALK_RELEASE_DELAY_MS).max(MAX_PUSH_TO_TALK_RELEASE_DELAY_MS),
  speakerVolumePercentage: (schema) => schema.min(0).max(MAX_USER_VOLUME_PERCENTAGE),
  virtualBackground: (schema) => schema.max(MAX_VIRTUAL_BACKGROUND_LENGTH),
  voiceInputMode: voiceInputModeSchema,
});
