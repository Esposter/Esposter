import type { ExpeditionDuration } from "#src/models/expedition/ExpeditionDuration";

import { expeditionDurationSchema } from "#src/models/expedition/ExpeditionDuration";
import { ExpeditionRegion } from "#src/models/expedition/ExpeditionRegion";
import { GameTextKey } from "genshin-text";
import { z } from "zod";

// A place an expedition is sent to, as the generated slice holds it: its id in the game's tables, the key of its name in
// The game text, the Adventure Rank it opens at, the scene point of the Statue that must be resonated with (zero for
// None), the quest that must be finished (empty for none), the region it is in, and each duration it offers
export interface ExpeditionPlace {
  durations: ExpeditionDuration[];
  id: number;
  nameTextId: GameTextKey;
  questId: string;
  rankLevel: number;
  region: ExpeditionRegion;
  statuePointId: number;
}

export const expeditionPlaceSchema = z.object({
  durations: z.array(expeditionDurationSchema),
  id: z.int().positive(),
  nameTextId: z.enum(GameTextKey) satisfies z.ZodType<GameTextKey>,
  questId: z.string(),
  rankLevel: z.int().nonnegative(),
  region: z.enum(ExpeditionRegion) satisfies z.ZodType<ExpeditionRegion>,
  statuePointId: z.int().nonnegative(),
}) satisfies z.ZodType<ExpeditionPlace>;
