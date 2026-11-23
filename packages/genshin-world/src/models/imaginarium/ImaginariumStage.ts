import type { ImaginariumStageEnemy } from "#src/models/imaginarium/ImaginariumStageEnemy";
import type { ImaginariumStageRefusal } from "#src/models/imaginarium/ImaginariumStageRefusal";

// One stage of a season that its wiki page gives at the lowest difficulty, Easy: its season, the act and battle it sits
// Under And its variant, the level Easy Mode fights at, the enemies its wiki names resolve to, in the order the wiki
// Names them, and The names it refused. A stage is fully resolved only when it has no refusals
export interface ImaginariumStage {
  act: string;
  battle: string;
  easyLevel: number;
  enemies: ImaginariumStageEnemy[];
  refusals: ImaginariumStageRefusal[];
  seasonId: number;
  variant: number;
}
