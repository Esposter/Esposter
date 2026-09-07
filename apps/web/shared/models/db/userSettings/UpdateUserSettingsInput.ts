import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserSettingsInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableUserSettingsSchema = selectUserSettingsInMessageSchema.pick({
  autoIdleThresholdMs: true,
  inputSensitivityDecibels: true,
  isDeafenOnJoin: true,
  isMuteOnJoin: true,
  microphoneVolumePercentage: true,
  noiseSuppressionMode: true,
  pushToTalkKeybind: true,
  pushToTalkReleaseDelayMs: true,
  speakerVolumePercentage: true,
  virtualBackground: true,
  voiceInputMode: true,
});

export const updateUserSettingsInputSchema = refineAtLeastOne(
  updatableUserSettingsSchema.partial(),
  updatableUserSettingsSchema.keyof().options,
);
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsInputSchema>;
