export interface DownloadFileUrl {
  // Images only; minted from the id alone, so it can point at a thumbnail blob that was never generated
  thumbnailUrl?: string;
  url: string;
}
