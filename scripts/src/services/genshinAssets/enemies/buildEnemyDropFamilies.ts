import type {
  EnemyDropFamilyKindRow,
  EnemyDropFamilyRow,
  EnemyDropTable,
  EnemyKind,
  EnemyMaterialDrop,
} from "genshin-world";

import {
  DROPS_TABLE_WIKI_MODULE_TITLE,
  FAMILYLESS_ENEMY_KIND_IDS,
} from "#src/services/genshinAssets/enemies/constants";
import { parseLuaTable } from "#src/services/genshinAssets/enemies/parseLuaTable";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { toEnemyKindName } from "#src/services/genshinAssets/enemies/toEnemyKindName";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { EnemyType } from "genshin-world";
import { z } from "zod";

// One of a family's material sets: its material names and their counts, paired by position. A set the wiki gives a fixed
// Count (Raw Meat for a Sumpter Beast) names it as a bare string and carries the `fixed` flag
const matSetSchema = z.object({
  fixed: z.literal(1).optional(),
  names: z.union([z.string(), z.array(z.string())]),
  nums: z.union([z.string(), z.array(z.number())]),
});
// The module's Enemies table: each family's members, which the Drops Tables name, its material sets and its Mora
const dropsModuleSchema = z.object({
  Enemies: z.array(
    z.object({
      MatSet1: matSetSchema.optional(),
      MatSet2: matSetSchema.optional(),
      members: z.array(z.string()),
      mora: z.number().nonnegative(),
    }),
  ),
});
type DropFamilyEntry = z.infer<typeof dropsModuleSchema>["Enemies"][number];
type MatSet = z.infer<typeof matSetSchema>;

// Each Drops Table an article lists, by the type it names, in the order the article lists them
const DROPS_TABLE_TYPE_REGEX = /\{\{Drops Table\|type=([^|}]+)/gu;

const toItemId = (name: string, nameItemIdsMap: ReadonlyMap<string, number[]>): number => {
  const itemIds = nameItemIdsMap.get(name) ?? [];
  if (itemIds.length !== 1)
    throw new InvalidOperationError(
      Operation.Read,
      name,
      itemIds.length === 0 ? "names no material" : "names more than one material",
    );
  return takeOne(itemIds);
};

const toMaterialDrops = (
  dropFamily: string,
  { fixed, names, nums }: MatSet,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
): EnemyMaterialDrop[] => {
  if (fixed !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      dropFamily,
      "has a material of a fixed count, which no drop table models",
    );
  if (!Array.isArray(names) || !Array.isArray(nums) || names.length !== nums.length)
    throw new InvalidOperationError(
      Operation.Read,
      dropFamily,
      "has a material set whose names and counts do not pair up",
    );
  return names.map((name, tier) => ({
    expectedCount: takeOne(nums, tier),
    itemId: toItemId(name, nameItemIdsMap),
    tier,
  }));
};

const toDropTable = (
  dropFamily: string,
  { MatSet1, MatSet2, mora }: DropFamilyEntry,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
): EnemyDropTable => ({
  materials: [MatSet1, MatSet2].flatMap((matSet) =>
    matSet === undefined ? [] : toMaterialDrops(dropFamily, matSet, nameItemIdsMap),
  ),
  mora,
});

// The drop families the non-boss kinds drop, and the family each kind drops, from the wiki. A kind's family is the first
// Drops Table its article lists: a kind listing two is an enemy in two states, and the first is the one a defeat drops.
// A kind whose article lists no Drops Table takes no family, and only a kind on the familyless list may take none. A boss
// Drops nothing, so its article is not read. Families are keyed by the Drops Table type they are named by, and each
// Material is resolved to the one item its English name is. Returns the family rows and the kind rows the enemies dataset
// Publishes
export const buildEnemyDropFamilies = (
  enemyKinds: readonly Pick<EnemyKind, "enemyType" | "id" | "nameTextId">[],
  englishTextMap: ReadonlyMap<string, string>,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
  cacheDirectory: string = WIKI_CACHE_DIRECTORY,
): { dropFamilies: EnemyDropFamilyRow[]; dropFamilyKinds: EnemyDropFamilyKindRow[] } => {
  const { Enemies: dropFamilies } = dropsModuleSchema.parse(
    parseLuaTable(readWikiPageContent(DROPS_TABLE_WIKI_MODULE_TITLE, cacheDirectory)),
  );
  const memberDropFamilyMap = new Map<string, DropFamilyEntry>();
  for (const dropFamily of dropFamilies)
    for (const member of dropFamily.members) {
      if (memberDropFamilyMap.has(member))
        throw new InvalidOperationError(Operation.Read, member, "is a member of more than one drop family");
      memberDropFamilyMap.set(member, dropFamily);
    }
  const dropFamilyRowMap = new Map<string, EnemyDropFamilyRow>();
  const dropFamilyKindRows: EnemyDropFamilyKindRow[] = [];
  for (const enemyKind of enemyKinds) {
    if (enemyKind.enemyType === EnemyType.Boss) continue;
    const name = toEnemyKindName(enemyKind, englishTextMap);
    const [firstDropsTable] = readWikiPageContent(name, cacheDirectory).matchAll(DROPS_TABLE_TYPE_REGEX);
    const family = firstDropsTable?.[1]?.trim();
    const isFamilyless = FAMILYLESS_ENEMY_KIND_IDS.includes(enemyKind.id);
    if (family === undefined) {
      if (!isFamilyless)
        throw new InvalidOperationError(Operation.Read, name, "has no Drops Table and is on no familyless list");
      continue;
    }
    if (isFamilyless)
      throw new InvalidOperationError(Operation.Read, name, "has a Drops Table, so it is on no familyless list");
    if (!dropFamilyRowMap.has(family)) {
      const dropFamily = memberDropFamilyMap.get(family);
      if (dropFamily === undefined)
        throw new InvalidOperationError(Operation.Read, family, "is no member of the Enemies table");
      dropFamilyRowMap.set(family, { family, ...toDropTable(family, dropFamily, nameItemIdsMap) });
    }
    dropFamilyKindRows.push({ enemyKindId: enemyKind.id, family });
  }
  return {
    dropFamilies: [...dropFamilyRowMap.values()].toSorted((firstFamilyRow, secondFamilyRow) =>
      firstFamilyRow.family.localeCompare(secondFamilyRow.family),
    ),
    dropFamilyKinds: dropFamilyKindRows.toSorted(
      (firstKindRow, secondKindRow) => firstKindRow.enemyKindId - secondKindRow.enemyKindId,
    ),
  };
};
