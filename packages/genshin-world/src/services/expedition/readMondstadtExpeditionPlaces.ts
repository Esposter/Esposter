import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

import { expeditionPlaceSchema } from "#src/models/expedition/ExpeditionPlace";
import { z } from "zod";

// Mondstadt's expedition places, the slice `pnpm -C scripts genshin:assets expeditions` writes, imported on demand as a
// Chunk of its own and checked against its shape as it arrives
export const readMondstadtExpeditionPlaces = async (): Promise<ExpeditionPlace[]> => {
  const { default: mondstadtExpeditionPlaces } = await import("#src/generated/expeditions/mondstadt.json");
  return z.array(expeditionPlaceSchema).parse(mondstadtExpeditionPlaces);
};
