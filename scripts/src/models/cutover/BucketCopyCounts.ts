// What one bucket's copy did: objects written, objects already stored and left alone, and objects removed for being gone from Azure
export interface BucketCopyCounts {
  copied: number;
  deleted: number;
  skipped: number;
}
