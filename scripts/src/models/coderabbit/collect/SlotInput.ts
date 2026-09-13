export interface SlotInput {
  // Files between the frontier and the `develop` head — what a review started now would actually read
  fileCount: number;
  isForced: boolean;
  // Whether the queue still owes commits that a later window would add to this same range
  isQueueOwing: boolean;
}
