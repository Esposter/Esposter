import type { WeaponData } from "#src/models/weapon/WeaponData";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A weapon's game data by its id, which every weapon the bag holds has
export const getWeaponData = (weaponDataMap: ReadonlyMap<number, WeaponData>, id: number): WeaponData => {
  const data = weaponDataMap.get(id);
  if (!data) throw new InvalidOperationError(Operation.Read, "weapon screen", `weapon ${id} has no data`);
  return data;
};
