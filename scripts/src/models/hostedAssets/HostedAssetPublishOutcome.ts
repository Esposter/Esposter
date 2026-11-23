// What a publish did: nothing, because the lock already names the publication; the records a dry run would store; or
// The Publication, stored in both accounts, whose lock is still to be committed
export const HostedAssetPublishOutcome = { DryRun: "dryRun", Published: "published", Unchanged: "unchanged" } as const;
export type HostedAssetPublishOutcome = (typeof HostedAssetPublishOutcome)[keyof typeof HostedAssetPublishOutcome];
