import type { WikiImaginariumStage } from "#src/models/genshinAssets/imaginarium/WikiImaginariumStage";
import type { ImaginariumStage } from "genshin-world";

import { resolveWikiEnemyName } from "#src/services/genshinAssets/imaginarium/resolveWikiEnemyName";

// One Easy stage of a season with its wiki enemy names resolved to monsters, in the order the wiki names them. A name no
// Monster or several hold is listed among the refusals with its count, so a stage is complete only when none is listed
export const toImaginariumStage = (
  stage: WikiImaginariumStage,
  seasonId: number,
  monsters: readonly { id: number; name: string }[],
): ImaginariumStage => {
  const resolutions = stage.enemyNames.map((name) => ({ name, resolution: resolveWikiEnemyName(name, monsters) }));
  return {
    act: stage.act,
    battle: stage.battle,
    easyLevel: stage.easyLevel,
    enemyIds: resolutions.flatMap(({ resolution }) => (resolution.isResolved ? [resolution.monsterId] : [])),
    refusals: resolutions.flatMap(({ name, resolution }) =>
      resolution.isResolved ? [] : [{ count: resolution.count, name }],
    ),
    seasonId,
    variant: stage.variant,
  };
};
