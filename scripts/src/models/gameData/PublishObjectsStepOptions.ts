import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";

export interface PublishObjectsStepOptions extends DryRunOptions {
  objects: GameDataPublication["objects"];
  retired?: GameDataBuild["retired"];
}
