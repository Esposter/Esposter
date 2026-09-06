import { z } from "zod";

export enum VoiceInputMode {
  PushToTalk = "PushToTalk",
  VoiceActivity = "VoiceActivity",
}

export const voiceInputModeSchema = z.enum(VoiceInputMode) satisfies z.ZodType<VoiceInputMode>;

export const VoiceInputModes: readonly VoiceInputMode[] = Object.values(VoiceInputMode);
