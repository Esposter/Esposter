import type { PavingStoneShape } from "genshin-engine";

import { z } from "zod";

// The paving round the statue as the Windrise fit traced it: where each stone is placed, and each mesh's shape
export interface WindrisePaving {
  placements: WindrisePavingPlacement[];
  shapes: Record<string, PavingStoneShape>;
}
// One stone set where its transform stands: its mesh's name, and its position, quaternion and scale
interface WindrisePavingPlacement {
  mesh: string;
  position: number[];
  rotation: number[];
  scale: number[];
}

const windrisePavingPlacementSchema = z.object({
  mesh: z.string().min(1),
  position: z.array(z.number()).length(3),
  rotation: z.array(z.number()).length(4),
  scale: z.array(z.number()).length(3),
}) satisfies z.ZodType<WindrisePavingPlacement>;
// A stone's outline is a polygon, so it has at least three radii
const pavingStoneShapeSchema = z.object({
  bottom: z.number(),
  radii: z.array(z.number().nonnegative()).min(3),
  top: z.number(),
}) satisfies z.ZodType<PavingStoneShape>;

export const windrisePavingSchema = z.object({
  placements: z.array(windrisePavingPlacementSchema),
  shapes: z.record(z.string().min(1), pavingStoneShapeSchema),
}) satisfies z.ZodType<WindrisePaving>;
