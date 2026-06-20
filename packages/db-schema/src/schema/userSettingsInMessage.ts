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

export const MIN_INPUT_SENSITIVITY_DECIBELS = -100;
export const MAX_INPUT_SENSITIVITY_DECIBELS = 0;
export const DEFAULT_INPUT_SENSITIVITY_DECIBELS = -50;
export const MAX_USER_VOLUME_PERCENTAGE = 200;
export const DEFAULT_USER_VOLUME_PERCENTAGE = 100;
export const MIN_AUTO_IDLE_THRESHOLD_MS = 60_000;
export const MAX_AUTO_IDLE_THRESHOLD_MS = 86_400_000;
export const DEFAULT_AUTO_IDLE_THRESHOLD_MS = 600_000;

export const userSettingsInMessage = pgTable(
  "userSettings",
  {
    autoIdleThresholdMs: integer().notNull().default(DEFAULT_AUTO_IDLE_THRESHOLD_MS),
    defaultUserVolumePercentage: integer().notNull().default(DEFAULT_USER_VOLUME_PERCENTAGE),
    inputSensitivityDecibels: integer().notNull().default(DEFAULT_INPUT_SENSITIVITY_DECIBELS),
    isDeafenOnJoin: boolean().notNull().default(false),
    isMuteOnJoin: boolean().notNull().default(false),
    pushToTalkKeybind: text().notNull().default(""),
    userId: text()
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    voiceInputMode: voiceInputModeEnum().notNull().default(VoiceInputMode.VoiceActivity),
  },
  {
    extraConfig: ({ autoIdleThresholdMs, defaultUserVolumePercentage, inputSensitivityDecibels }) => [
      check(
        "user_settings_input_sensitivity_decibels_check",
        sql`${inputSensitivityDecibels} BETWEEN ${sql.raw(MIN_INPUT_SENSITIVITY_DECIBELS.toString())} AND ${sql.raw(MAX_INPUT_SENSITIVITY_DECIBELS.toString())}`,
      ),
      check(
        "user_settings_default_user_volume_percentage_check",
        sql`${defaultUserVolumePercentage} BETWEEN 0 AND ${sql.raw(MAX_USER_VOLUME_PERCENTAGE.toString())}`,
      ),
      check(
        "user_settings_auto_idle_threshold_ms_check",
        sql`${autoIdleThresholdMs} BETWEEN ${sql.raw(MIN_AUTO_IDLE_THRESHOLD_MS.toString())} AND ${sql.raw(MAX_AUTO_IDLE_THRESHOLD_MS.toString())}`,
      ),
    ],
    schema: messageSchema,
  },
);
export type UserSettingsInMessage = typeof userSettingsInMessage.$inferSelect;

export const selectUserSettingsInMessageSchema = createSelectSchema(userSettingsInMessage, {
  autoIdleThresholdMs: (schema) => schema.min(MIN_AUTO_IDLE_THRESHOLD_MS).max(MAX_AUTO_IDLE_THRESHOLD_MS),
  defaultUserVolumePercentage: (schema) => schema.min(0).max(MAX_USER_VOLUME_PERCENTAGE),
  inputSensitivityDecibels: (schema) => schema.min(MIN_INPUT_SENSITIVITY_DECIBELS).max(MAX_INPUT_SENSITIVITY_DECIBELS),
  voiceInputMode: voiceInputModeSchema,
});
