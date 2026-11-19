import type { ArticleDropSource } from "#src/services/genshinAssets/enemies/toArticleDropSource";
import type {
  EnemyDropFamilyKindRow,
  EnemyDropFamilyRow,
  EnemyDropSource,
  EnemyDropTable,
  EnemyKind,
  EnemyMaterialDrop,
} from "genshin-world";

import { buildEnemyDropTemplate } from "#src/services/genshinAssets/enemies/buildEnemyDropTemplate";
import { DROPS_TABLE_WIKI_MODULE_TITLE } from "#src/services/genshinAssets/enemies/constants";
import { parseLuaTable } from "#src/services/genshinAssets/enemies/parseLuaTable";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { toArticleDropSource } from "#src/services/genshinAssets/enemies/toArticleDropSource";
import { toEnemyKindName } from "#src/services/genshinAssets/enemies/toEnemyKindName";
import { toMaterialItemId } from "#src/services/genshinAssets/enemies/toMaterialItemId";
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
    itemId: toMaterialItemId(name, nameItemIdsMap),
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

// The drop source a kind's article gives, joined to the kind. A template's materials are read through the drops module
const toDropSource = (
  articleSource: ArticleDropSource,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
  cacheDirectory: string,
): EnemyDropSource => {
  if (articleSource.type === "template")
    return {
      materials: buildEnemyDropTemplate(articleSource.template, nameItemIdsMap, cacheDirectory),
      type: "template",
    };
  if (articleSource.type === "family") return { type: "family" };
  return { type: articleSource.type };
};

// Each kind's drop source, from its own wiki article, and the drop families the kinds of a family take, from the wiki's
// Enemies table. A boss's article gives its reward or none; a kind that is no boss gives a family, template or none.
// A kind whose article lists two Drops Tables takes the first, the one its defeat drops. Families are keyed by
// The Drops Table type they are named by, and each material is resolved to the one item its English name is. Returns the
// Family rows, the rows joining each family kind to its family, and every kind with the drop source its article gives
export const buildEnemyDropSources = <T extends Pick<EnemyKind, "enemyType" | "id" | "nameTextId">>(
  enemyKinds: readonly T[],
  englishTextMap: ReadonlyMap<string, string>,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
  cacheDirectory: string = WIKI_CACHE_DIRECTORY,
): {
  dropFamilies: EnemyDropFamilyRow[];
  dropFamilyKinds: EnemyDropFamilyKindRow[];
  enemyKindRows: (T & { dropSource: EnemyDropSource })[];
} => {
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
  const kindArticleSources = enemyKinds.map((enemyKind) => {
    const name = toEnemyKindName(enemyKind, englishTextMap);
    const articleSource = toArticleDropSource(name, readWikiPageContent(name, cacheDirectory));
    const isBossSource = articleSource.type === "bossReward" || articleSource.type === "none";
    if (enemyKind.enemyType === EnemyType.Boss && !isBossSource)
      throw new InvalidOperationError(
        Operation.Read,
        name,
        "is a boss whose article gives a drop family or a template",
      );
    if (enemyKind.enemyType !== EnemyType.Boss && articleSource.type === "bossReward")
      throw new InvalidOperationError(Operation.Read, name, "is no boss, but its article gives a boss's reward");
    return { articleSource, enemyKind };
  });
  const dropFamilyRowMap = new Map<string, EnemyDropFamilyRow>();
  const dropFamilyKindRows: EnemyDropFamilyKindRow[] = [];
  for (const { articleSource, enemyKind } of kindArticleSources) {
    if (articleSource.type !== "family") continue;
    const { family } = articleSource;
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
    enemyKindRows: kindArticleSources.map(({ articleSource, enemyKind }) => ({
      ...enemyKind,
      dropSource: toDropSource(articleSource, nameItemIdsMap, cacheDirectory),
    })),
  };
};
