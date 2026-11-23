import { HostedAssetPublishOutcome } from "#src/models/hostedAssets/HostedAssetPublishOutcome";

// The note a publish returns when it stores nothing and makes no request, which every publish words the same way. The label
// Is the product's name, or the scopes a generator replaces
export const formatIdleHostedAssetPublish = (
  label: string,
  outcome: typeof HostedAssetPublishOutcome.Empty | typeof HostedAssetPublishOutcome.Unchanged,
): string =>
  outcome === HostedAssetPublishOutcome.Unchanged
    ? `${label}: unchanged, no request made`
    : `${label}: nothing published, no request made`;
