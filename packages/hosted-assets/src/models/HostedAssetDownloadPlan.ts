import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

// The files a preload still fetches, and the bytes they come to
export interface HostedAssetDownloadPlan {
  files: HostedAssetDownloadFile[];
  pendingBytes: number;
}
