import type { EnemyKind } from "genshin-world";

import {
  DROPS_DATA_WIKI_TITLE,
  DROPS_TABLE_WIKI_MODULE_TITLE,
  DROPS_TEMPLATE_WIKI_TITLE,
} from "#src/services/genshinAssets/enemies/constants";
import { toEnemyKindName } from "#src/services/genshinAssets/enemies/toEnemyKindName";

// The wiki pages the enemies are read from: the drops modules and the drops template, then the article of every kind, a
// Boss's among them, since each kind's drop source is read from its article
export const toEnemyWikiPageTitles = (
  enemyKinds: readonly Pick<EnemyKind, "id" | "nameTextId">[],
  englishTextMap: ReadonlyMap<string, string>,
): string[] => [
  ...new Set([
    DROPS_DATA_WIKI_TITLE,
    DROPS_TABLE_WIKI_MODULE_TITLE,
    DROPS_TEMPLATE_WIKI_TITLE,
    ...enemyKinds.map((enemyKind) => toEnemyKindName(enemyKind, englishTextMap)),
  ]),
];
