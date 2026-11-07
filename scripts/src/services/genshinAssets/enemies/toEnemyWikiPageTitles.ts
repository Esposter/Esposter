import type { EnemyKind } from "genshin-world";

import { DROPS_TABLE_WIKI_MODULE_TITLE } from "#src/services/genshinAssets/enemies/constants";
import { toEnemyKindName } from "#src/services/genshinAssets/enemies/toEnemyKindName";
import { EnemyType } from "genshin-world";

// The wiki pages the enemies are read from, each once: the drops module, and the article of every kind that is not a
// Boss, since a drop family is joined to a kind through its article
export const toEnemyWikiPageTitles = (
  enemyKinds: readonly Pick<EnemyKind, "enemyType" | "id" | "nameTextId">[],
  englishTextMap: ReadonlyMap<string, string>,
): string[] => [
  ...new Set([
    DROPS_TABLE_WIKI_MODULE_TITLE,
    ...enemyKinds
      .filter(({ enemyType }) => enemyType !== EnemyType.Boss)
      .map((enemyKind) => toEnemyKindName(enemyKind, englishTextMap)),
  ]),
];
