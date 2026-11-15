import { z } from "zod";

export const VoiceInputMode = { PushToTalk: "PushToTalk", VoiceActivity: "VoiceActivity" } as const;
export type VoiceInputMode = (typeof VoiceInputMode)[keyof typeof VoiceInputMode];

export const voiceInputModeSchema = z.enum(VoiceInputMode) satisfies z.ZodType<VoiceInputMode>;

export const VoiceInputModes: readonly VoiceInputMode[] = Object.values(VoiceInputMode);
