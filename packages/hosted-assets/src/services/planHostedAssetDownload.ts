import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";
import type { HostedAssetDownloadPlan } from "#src/models/HostedAssetDownloadPlan";

// The files the cache lacks, each matched by the url it is kept under, and the bytes they come to. A held url is
// Matched exactly, so a republished file, keyed by its new hash, is planned again
export const planHostedAssetDownload = (
  files: readonly HostedAssetDownloadFile[],
  heldUrls: ReadonlySet<string>,
): HostedAssetDownloadPlan => {
  const pendingFiles = files.filter(({ url }) => !heldUrls.has(url));
  return { files: pendingFiles, pendingBytes: pendingFiles.reduce((total, { bytes }) => total + bytes, 0) };
};
