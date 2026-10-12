import type { ReviewFile } from "#src/models/review/ReviewFile";

// One batch of one window, as the reviewer pool takes it: which window and batch it is, and the files it reads
export interface ReviewBatchJob {
  batchIndex: number;
  files: ReviewFile[];
  windowIndex: number;
}
