import type { StatuePart, StatueSection } from "genshin-engine";

import { z } from "zod";

// The statue as the Windrise fit traced it: each of its parts, the mesh it is drawn with and where it stands, and the
// Sections of its shaft
export interface WindriseStatue {
  parts: StatuePart[];
}

// One section of a part's shaft: its ring's centre in the part's own x and z, its height, and its radius about the
// Centre at each of the part's angles
const statueSectionSchema = z.object({
  centre: z.array(z.number()).length(2),
  height: z.number().positive(),
  radii: z.array(z.number().nonnegative()),
}) satisfies z.ZodType<StatueSection>;
const statuePartSchema = z.object({
  part: z.string().min(1),
  position: z.array(z.number()).length(3),
  rotation: z.array(z.number()).length(4),
  sections: z.array(statueSectionSchema).min(1),
}) satisfies z.ZodType<StatuePart>;

export const windriseStatueSchema = z.object({ parts: z.array(statuePartSchema) }) satisfies z.ZodType<WindriseStatue>;
