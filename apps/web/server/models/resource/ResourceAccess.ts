// What one resource answers for a caller before any of its assets is asked about: whether the caller owns it, or else
// The version its current publication names, which is absent when nothing is published
export interface ResourceAccess {
  isOwned: boolean;
  publishVersion?: number;
}
