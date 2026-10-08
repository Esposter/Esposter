import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";

import { characterConstellationKitSchema } from "#src/models/character/CharacterConstellationKit";
import { z } from "zod";

// The constellation table `pnpm -C scripts genshin:assets stats` writes, imported on demand as a chunk of its own and
// Checked against its shape as it arrives
export const readConstellationTables = async (): Promise<CharacterConstellationKit[]> => {
  const { default: characterConstellationKits } = await import("#src/generated/stats/characterConstellationKits.json");
  return z.array(characterConstellationKitSchema).parse(characterConstellationKits);
};
