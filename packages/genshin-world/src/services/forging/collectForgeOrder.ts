import type { ForgeOrder } from "#src/models/forging/ForgeOrder";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { ForgeResult } from "#src/models/forging/ForgeResult";
import type { ForgeTalent } from "#src/models/forging/ForgeTalent";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { ForgeTalentKind } from "#src/models/forging/ForgeTalent";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { drawForgeResult } from "#src/services/forging/drawForgeResult";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { toWeaponDefinition } from "#src/services/inventory/toWeaponDefinition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag, the Adventure EXP and order after every unit of a queue's order done by `now` is taken in. Each done unit yields
// One result drawn by weight from its recipe's results, and an extra copy of it at the chance the talents of this forge type
// Give. A material result is taken from the item definitions, and a weapon result, the weapon recipes' only kind, from the
// Weapons' names and rarities, each a weapon entry of its own. The units done are counted from the moment the order began
// At its seconds a unit, and a unit's result is taken whole, so the units done before the first the bag has no room for
// Are taken in, and that unit waits in the queue with the units behind it. An order fully collected is no order, and its
// Queue is free again
export const collectForgeOrder = (
  recipe: ForgeRecipe,
  order: ForgeOrder,
  {
    definitions,
    inventory,
    now,
    random,
    talents,
    weapons,
  }: {
    definitions: Map<number, ItemDefinition>;
    inventory: Inventory;
    now: Temporal.Instant;
    random: () => number;
    talents: ForgeTalent[];
    weapons: Map<number, Pick<ItemDefinition, "name"> & WeaponData>;
  },
): { adventureExp: number; inventory: Inventory; order?: ForgeOrder } => {
  const elapsedSeconds = now.since(order.startedAt).total({ unit: "second" });
  const doneCount = Math.min(order.count, Math.max(Math.floor(elapsedSeconds / order.unitSeconds), 0));
  if (doneCount === 0) return { adventureExp: 0, inventory, order };
  const missChance = talents
    .filter(({ forgeType, kind }) => forgeType === recipe.forgeType && kind === ForgeTalentKind.ExtraResult)
    .reduce((chanceMissed, { ratio }) => chanceMissed * (1 - ratio), 1);
  const yields: ForgeResult[] = Array.from({ length: doneCount }, () => {
    const result = drawForgeResult(recipe.results, random());
    return random() < 1 - missChance ? { ...result, count: result.count * 2 } : result;
  });
  let addition = { adventureExp: 0, collectedCount: 0, inventory };
  for (const { count, itemId } of yields) {
    if (itemId === ADVENTURE_EXP_ITEM_ID) {
      addition = {
        ...addition,
        adventureExp: addition.adventureExp + count,
        collectedCount: addition.collectedCount + 1,
      };
      continue;
    }
    const added = addInventoryItem(addition.inventory, toResultDefinition(recipe, itemId, definitions, weapons), count);
    if (added.overflow > 0) break;
    addition = { ...addition, collectedCount: addition.collectedCount + 1, inventory: added.inventory };
  }
  const { adventureExp, collectedCount } = addition;
  if (collectedCount === 0) return { adventureExp: 0, inventory, order };
  const remainingCount = order.count - collectedCount;
  if (remainingCount === 0) return { adventureExp, inventory: addition.inventory };
  return {
    adventureExp,
    inventory: addition.inventory,
    order: {
      count: remainingCount,
      recipeId: order.recipeId,
      startedAt: order.startedAt.add({ seconds: collectedCount * order.unitSeconds }),
      unitSeconds: order.unitSeconds,
    },
  };
};

// A weapon is in the bag as the wish grants one: a weapon category entry of one, with no rank of its own, since its tab
// Sorts it by level and quality. A material's definition is read from its item id
const toResultDefinition = (
  recipe: ForgeRecipe,
  itemId: number,
  definitions: Map<number, ItemDefinition>,
  weapons: Map<number, Pick<ItemDefinition, "name"> & WeaponData>,
): ItemDefinition => {
  if (recipe.kind === ForgeRecipeKind.Weapon) {
    const weapon = weapons.get(itemId);
    if (!weapon) throw new InvalidOperationError(Operation.Read, String(itemId), "has no weapon definition");
    return toWeaponDefinition(weapon, weapon.name);
  }
  const definition = definitions.get(itemId);
  if (!definition) throw new InvalidOperationError(Operation.Read, String(itemId), "has no definition in the bag");
  return definition;
};
