import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

export interface PublishGameDataStepOptions extends DryRunOptions {
  publication: HostedAssetPublication;
  scopes: GameDataScope[];
}
