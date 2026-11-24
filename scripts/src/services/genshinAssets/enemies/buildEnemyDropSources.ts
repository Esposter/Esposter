import type { DropFamilyEntry } from "#src/models/genshinAssets/enemies/DropFamilyEntry";
import type { EnemyDropFamilyKindRow, EnemyDropFamilyRow, EnemyDropSource, EnemyKind } from "genshin-world";

import { dropFamilyEntrySchema } from "#src/models/genshinAssets/enemies/DropFamilyEntry";
import { DROPS_TABLE_WIKI_MODULE_TITLE } from "#src/services/genshinAssets/enemies/constants";
import { parseLuaTable } from "#src/services/genshinAssets/enemies/parseLuaTable";
import { readWikiPageContent } from "#src/services/genshinAssets/enemies/readWikiPageContent";
import { toArticleDropSource } from "#src/services/genshinAssets/enemies/toArticleDropSource";
import { toDropSource } from "#src/services/genshinAssets/enemies/toDropSource";
import { toDropTable } from "#src/services/genshinAssets/enemies/toDropTable";
import { toEnemyKindName } from "#src/services/genshinAssets/enemies/toEnemyKindName";
import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { EnemyType } from "genshin-world/definitions";
import { z } from "zod";

const dropsModuleSchema = z.object({ Enemies: z.array(dropFamilyEntrySchema) });

// Each kind's drop source, from its own wiki article, and the drop families the kinds of a family take, from the wiki's
// Enemies table. A boss's article gives its reward or none; a kind that is no boss gives a family, template or none.
// A kind whose article lists two Drops Tables takes the first, the one its defeat drops. Families are keyed by
// The Drops Table type they are named by, and each material is resolved to the one item its English name is. Returns
// The family rows, the rows joining each family kind to its family, and every kind with the drop source its article
// Gives
export const buildEnemyDropSources = <T extends Pick<EnemyKind, "enemyType" | "id" | "nameTextId">>(
  enemyKinds: readonly T[],
  englishTextMap: ReadonlyMap<string, string>,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
  cacheDirectory: string = WIKI_CACHE_DIRECTORY,
): {
  dropFamilies: EnemyDropFamilyRow[];
  dropFamilyKinds: EnemyDropFamilyKindRow[];
  enemyKindRows: ({ dropSource: EnemyDropSource } & T)[];
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
