import { z } from "zod";

export enum VoiceSignalType {
  Answer = "Answer",
  Candidate = "Candidate",
  Offer = "Offer",
}

export const voiceSignalTypeSchema = z.enum(VoiceSignalType) satisfies z.ZodType<VoiceSignalType>;
