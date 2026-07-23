export interface DownloadFileUrl {
  // Images only, and only when a thumbnail was generated at upload time
  thumbnailUrl?: string;
  url: string;
}
