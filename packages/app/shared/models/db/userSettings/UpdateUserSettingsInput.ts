import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserSettingsInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserSettingsInputSchema = refineAtLeastOne(
  selectUserSettingsInMessageSchema
    .pick({
      autoIdleThresholdMs: true,
      inputSensitivityDecibels: true,
      isDeafenOnJoin: true,
      isMuteOnJoin: true,
      microphoneVolumePercentage: true,
      noiseSuppressionMode: true,
      pushToTalkKeybind: true,
      speakerVolumePercentage: true,
      voiceInputMode: true,
    })
    .partial(),
  [
    "autoIdleThresholdMs",
    "inputSensitivityDecibels",
    "isDeafenOnJoin",
    "isMuteOnJoin",
    "microphoneVolumePercentage",
    "noiseSuppressionMode",
    "pushToTalkKeybind",
    "speakerVolumePercentage",
    "voiceInputMode",
  ],
);
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsInputSchema>;
