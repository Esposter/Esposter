import { z } from "zod";

export enum CallSignalType {
  Answer = "Answer",
  Candidate = "Candidate",
  Offer = "Offer",
}

export const callSignalTypeSchema = z.enum(CallSignalType) satisfies z.ZodType<CallSignalType>;
