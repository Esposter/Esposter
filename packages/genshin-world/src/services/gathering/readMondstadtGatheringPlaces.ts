import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { gatheringPlaceSchema } from "#src/models/gathering/GatheringPlace";
import { z } from "zod";

// Mondstadt's gathering points, imported on demand from their generated slice as the world opens, and checked against
// Their schema as they arrive
export const readMondstadtGatheringPlaces = async (): Promise<GatheringPlace[]> => {
  const { default: places } = await import("#src/generated/gathering/mondstadt.json");
  return z.array(gatheringPlaceSchema).parse(places);
};
