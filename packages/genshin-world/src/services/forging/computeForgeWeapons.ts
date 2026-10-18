import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";

// The weapons the forge yields, by their item ids, each named in the reader's language: only those a weapon recipe's
// Results name, since a weapon outside the forge is never a result the bag takes in from it
export const computeForgeWeapons = (
  recipes: readonly ForgeRecipe[],
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  names: Readonly<Record<string, string>>,
): Map<number, Pick<ItemDefinition, "name"> & WeaponData> => {
  const weaponIds = new Set(
    recipes
      .filter(({ kind }) => kind === ForgeRecipeKind.Weapon)
      .flatMap(({ results }) => results.map(({ itemId }) => itemId)),
  );
  return new Map(
    [...weaponDataMap]
      .filter(([id]) => weaponIds.has(id))
      .map(([id, weapon]): [number, Pick<ItemDefinition, "name"> & WeaponData] => [
        id,
        { ...weapon, name: names[weapon.nameTextId] ?? "" },
      ]),
  );
};
