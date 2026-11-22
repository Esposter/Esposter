import type { ArticleDropSource } from "#src/services/genshinAssets/enemies/toArticleDropSource";
import type { EnemyDropSource } from "genshin-world";

import { buildEnemyDropTemplate } from "#src/services/genshinAssets/enemies/buildEnemyDropTemplate";

// The drop source a kind's article gives, joined to the kind. A template's materials are read through the drops module
export const toDropSource = (
  articleSource: ArticleDropSource,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
  cacheDirectory: string,
): EnemyDropSource => {
  if (articleSource.type === "template")
    return {
      materials: buildEnemyDropTemplate(articleSource.template, nameItemIdsMap, cacheDirectory),
      type: "template",
    };
  else if (articleSource.type === "family") return { type: "family" };
  else return { type: articleSource.type };
};
