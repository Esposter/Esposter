import { VoiceSignalType, voiceSignalTypeSchema } from "#shared/models/room/voice/VoiceSignalType";
import { z } from "zod";

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
