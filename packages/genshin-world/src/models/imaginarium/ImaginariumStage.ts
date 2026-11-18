import type { ImaginariumStageRefusal } from "#src/models/imaginarium/ImaginariumStageRefusal";

// One stage of a season that its wiki page gives at the lowest difficulty, Easy: its season, the act and battle it sits under
// And its variant, the level Easy Mode fights at, the monsters its enemies resolve to by exact name, in the order the wiki
// Names them, and the names it refused. A stage is fully resolved only when it has no refusals
export interface ImaginariumStage {
  act: string;
  battle: string;
  easyLevel: number;
  enemyIds: number[];
  refusals: ImaginariumStageRefusal[];
  seasonId: number;
  variant: number;
}
