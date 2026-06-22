import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserSettingsInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateUserSettingsInputSchema = refineAtLeastOne(
  selectUserSettingsInMessageSchema
    .pick({
      autoIdleThresholdMs: true,
      defaultUserVolumePercentage: true,
      inputSensitivityDecibels: true,
      isDeafenOnJoin: true,
      isMuteOnJoin: true,
      pushToTalkKeybind: true,
      voiceInputMode: true,
    })
    .partial(),
  [
    "autoIdleThresholdMs",
    "defaultUserVolumePercentage",
    "inputSensitivityDecibels",
    "isDeafenOnJoin",
    "isMuteOnJoin",
    "pushToTalkKeybind",
    "voiceInputMode",
  ],
);
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsInputSchema>;
