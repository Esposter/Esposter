import { z } from "zod";

export enum VoiceSignalType {
  Answer = "answer",
  Candidate = "candidate",
  Offer = "offer",
}

export const voiceSignalTypeSchema = z.enum(VoiceSignalType);
