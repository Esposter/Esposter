import { z } from "zod";

import { VoiceSignalType, voiceSignalTypeSchema } from "#shared/models/room/voice/VoiceSignalType";

export interface VoiceSignalPayload {
  data: string;
  targetUserId: string;
  type: VoiceSignalType;
}

export const voiceSignalPayloadSchema = z.object({
  data: z.string(),
  targetUserId: z.string(),
  type: voiceSignalTypeSchema,
}) satisfies z.ZodType<VoiceSignalPayload>;
