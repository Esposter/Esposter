import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { HostedAssetPlan } from "#src/models/hostedAssets/HostedAssetPlan";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

export interface PublishGameDataPlanOptions extends DryRunOptions {
  plan: HostedAssetPlan;
  scopes: GameDataScope[];
}
