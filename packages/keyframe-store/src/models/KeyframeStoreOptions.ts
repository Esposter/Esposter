// The tunables, each defaulted from `constants`. Options rather than constants in the algorithm so a benchmark
// Can sweep them without editing the implementation
export interface KeyframeStoreOptions {
  compressionLevel?: number;
  // A delta is written only when it is at most this share of the version's standalone compressed size
  promotionRatio?: number;
  // The bytes a keyframe's deltas may accumulate to, as a multiple of the keyframe's own stored size
  segmentBudgetRatio?: number;
}
