// One file a preload holds: the url it is kept under, the bytes it comes to, and the path a failure names it by
export interface HostedAssetDownloadFile {
  bytes: number;
  path: string;
  url: string;
}
