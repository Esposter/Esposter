import type { WikiImaginariumStage } from "#src/models/genshinAssets/imaginarium/WikiImaginariumStage";
import type { ImaginariumStage, ImaginariumStageEnemy, ImaginariumStageRefusal } from "genshin-world";

import { resolveWikiEnemyName } from "#src/services/genshinAssets/imaginarium/resolveWikiEnemyName";

type StageNameOutcome = { enemy: ImaginariumStageEnemy } | { refusal: ImaginariumStageRefusal };
// One Easy stage of a season, with its wiki enemy names resolved to the enemies they fight as.
// They keep the order the wiki gives them.
// A name whose monsters span several entries, or that no monster holds, is refused with its count.
// A name whose entry's codex names no monster row `toEnemy` gives an enemy for is refused too.
// A stage is complete only with no refusal.
export const toImaginariumStage = (
  stage: WikiImaginariumStage,
  seasonId: number,
  monsters: readonly { describeId: number; id: number; name: string }[],
  toEnemy: (describeId: number) => ImaginariumStageEnemy | undefined,
): ImaginariumStage => {
  const outcomes = stage.enemyNames.map((name): StageNameOutcome => {
    const resolution = resolveWikiEnemyName(name, monsters);
    if (!resolution.isResolved) return { refusal: { count: resolution.count, name, reason: "entries" } };
    const enemy = toEnemy(resolution.describeId);
    return enemy ? { enemy } : { refusal: { describeId: resolution.describeId, name, reason: "codex" } };
  });
  return {
    act: stage.act,
    battle: stage.battle,
    easyLevel: stage.easyLevel,
    enemies: outcomes.flatMap((outcome) => ("enemy" in outcome ? [outcome.enemy] : [])),
    refusals: outcomes.flatMap((outcome) => ("refusal" in outcome ? [outcome.refusal] : [])),
    seasonId,
    variant: stage.variant,
  };
};
