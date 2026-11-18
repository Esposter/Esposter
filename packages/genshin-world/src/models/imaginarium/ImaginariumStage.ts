import type { ImaginariumStageRefusal } from "#src/models/imaginarium/ImaginariumStageRefusal";

// One stage of a season that its wiki page gives at the lowest difficulty, Easy: its season, the act and battle it sits under
// And its variant, the level Easy Mode fights at, the codex entries its enemies resolve to by exact name, in the order the
// Wiki names them, and the names it refused. A stage is fully resolved only when it has no refusals. Its monsters' stats
// Come from the level through the game's own level curve, when a fight reads the stage
export interface ImaginariumStage {
  act: string;
  battle: string;
  describeIds: number[];
  easyLevel: number;
  refusals: ImaginariumStageRefusal[];
  seasonId: number;
  variant: number;
}
