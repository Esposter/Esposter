import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";

import { z } from "zod";

// The weapon levelling table `pnpm -C scripts genshin:assets stats` writes, imported on demand as a chunk of its own and
// Checked against its shape as it arrives
export const readWeaponLevelRequiredExps = async (): Promise<RarityRequiredExpsMap> => {
  const { default: weaponLevelRequiredExps } = await import("#src/generated/stats/weaponLevelRequiredExps.json");
  return z.record(z.string(), z.array(z.int().positive())).parse(weaponLevelRequiredExps);
};
