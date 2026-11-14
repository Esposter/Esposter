import type { R2Object } from "#src/models/cutover/R2Object";

// One page of a ListObjectsV2 answer. `nextContinuationToken` is "" on the last page
export interface R2ListPage {
  nextContinuationToken: string;
  objects: R2Object[];
}
