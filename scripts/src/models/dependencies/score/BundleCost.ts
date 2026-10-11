// A package's gzipped bytes in the app's client bundle, or the reason none were measured
export interface BundleCost {
  bytes: number;
  skipReason: string;
}
