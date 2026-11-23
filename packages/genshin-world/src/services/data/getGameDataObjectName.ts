import type { HostedAssetName } from "hosted-assets";

import { GAME_DATA_OBJECT_EXTENSION } from "#src/services/data/constants";

// The name a record stored under a dataset takes: the dataset is its scope, and the sha256 of its JSON names it
export const getGameDataObjectName = (dataset: string, sha256: string): HostedAssetName => ({
  extension: GAME_DATA_OBJECT_EXTENSION,
  scope: dataset,
  sha256,
});
