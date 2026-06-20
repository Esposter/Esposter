import { VoiceInputMode } from "@esposter/db-schema";

export const VoiceInputModeLabelMap = {
  [VoiceInputMode.PushToTalk]: "Push to Talk",
  [VoiceInputMode.VoiceActivity]: "Voice Activity",
} as const satisfies Record<VoiceInputMode, string>;
