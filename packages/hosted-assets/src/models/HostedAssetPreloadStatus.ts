// Where a product's preload stands: not yet planned, fetching the files the cache lacks, held in full, or stopped by a
// File that failed its attempts
export const HostedAssetPreloadStatus = {
  Downloading: "downloading",
  Failed: "failed",
  Idle: "idle",
  Ready: "ready",
} as const;
export type HostedAssetPreloadStatus = (typeof HostedAssetPreloadStatus)[keyof typeof HostedAssetPreloadStatus];
