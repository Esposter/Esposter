import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";

import { homeBlueprintSchema } from "#src/models/home/HomeBlueprint";
import { z } from "zod";

// The furnishings Tubby makes, the slice `pnpm -C scripts genshin:assets home` writes, imported on demand as a chunk of its
// Own and checked against its shape as it arrives
export const readHomeBlueprints = async (): Promise<HomeBlueprint[]> => {
  const { default: blueprints } = await import("#src/generated/home/blueprints.json");
  return z.array(homeBlueprintSchema).parse(blueprints);
};
