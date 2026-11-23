import type { HostedAssetPublication } from "#src/models/hostedAssets/HostedAssetPublication";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

export interface PublishObjectsStepOptions extends DryRunOptions {
  objects: HostedAssetPublication["objects"];
  retired?: GameDataBuild["retired"];
}
