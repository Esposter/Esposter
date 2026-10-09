import { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import { z } from "zod";

// One doing an area's exploration counts: the id the game's table files it under, its kind, and the weight the table
// Gives it toward the area's total
export interface ExplorationDoing {
  id: string;
  kind: ExplorationKind;
  weight: number;
}

export const explorationDoingSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(ExplorationKind) satisfies z.ZodType<ExplorationKind>,
  weight: z.int().positive(),
}) satisfies z.ZodType<ExplorationDoing>;
