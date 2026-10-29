import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

export interface PublishGameDataStepOptions extends DryRunOptions {
  publication: GameDataPublication;
  scopes: GameDataScope[];
}
