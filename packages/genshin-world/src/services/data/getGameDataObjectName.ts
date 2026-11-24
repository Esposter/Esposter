import type { HostedAssetName } from "hosted-assets";

import { HOSTED_RECORD_EXTENSION } from "hosted-assets";

// The name a record stored under a dataset takes: the dataset is its scope, and the sha256 of its JSON names it
export const getGameDataObjectName = (dataset: string, sha256: string): HostedAssetName => ({
  extension: HOSTED_RECORD_EXTENSION,
  scope: dataset,
  sha256,
});
