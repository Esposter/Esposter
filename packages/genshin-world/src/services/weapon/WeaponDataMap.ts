import type { WeaponData } from "#src/models/weapon/WeaponData";

import weapons from "#src/generated/stats/weapons.json";
import { weaponDataSchema } from "#src/models/weapon/WeaponData";
import { z } from "zod";

// Every weapon by its id, as `pnpm -C scripts genshin:assets stats` writes it from the game's tables, checked against
// Its schema as the world's code loads
export const WeaponDataMap: ReadonlyMap<number, WeaponData> = new Map(
  z
    .array(weaponDataSchema)
    .parse(weapons)
    .map((weaponData) => [weaponData.id, weaponData]),
);
