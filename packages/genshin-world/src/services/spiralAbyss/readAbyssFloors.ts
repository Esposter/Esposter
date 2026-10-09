import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";

import { abyssFloorSchema } from "#src/models/spiralAbyss/AbyssFloor";
import { z } from "zod";

// Every floor of the Spiral Abyss in the game's tower table, the slice `pnpm -C scripts genshin:assets spiral-abyss` writes,
// Imported on demand as a chunk of its own and checked against its shape as it arrives
export const readAbyssFloors = async (): Promise<AbyssFloor[]> => {
  const { default: floors } = await import("#src/generated/spiralAbyss/floors.json");
  return z.array(abyssFloorSchema).parse(floors);
};
