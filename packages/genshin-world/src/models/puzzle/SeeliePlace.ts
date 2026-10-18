import { z } from "zod";

// A Seelie's place as its region's courts give it: whether the official map marks a court in the Seelie's region. Where it
// Does not, the Seelie has no court to be led to, so the place is provisional until a court source gives one
export interface SeeliePlace {
  isProvisional: boolean;
}

export const seeliePlaceSchema = z.object({ isProvisional: z.boolean() }) satisfies z.ZodType<SeeliePlace>;
