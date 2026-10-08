import { z } from "zod";

// A building of Fontaine's plan: a front of bays, each an arched opening below and a window column above, set on a depth
// Of storeys behind it. Its front faces south, which is its positive z
export interface FontaineBuildingOptions {
  bayCount: number;
  // Metres from one bay's edge to the next's
  bayWidth: number;
  // Metres from the front face to the back
  depth: number;
  // Cream ashlar storeys above the arched ground floor
  storeyCount: number;
}

export const fontaineBuildingOptionsSchema = z.object({
  bayCount: z.int().positive(),
  bayWidth: z.number().positive(),
  depth: z.number().positive(),
  storeyCount: z.int().positive(),
}) satisfies z.ZodType<FontaineBuildingOptions>;
