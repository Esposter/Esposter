import type { ReviewFile } from "#src/models/review/ReviewFile";

// Packs files, already in path order, into batches in that order: a batch closes before a file that would take it past
// Either cap. A file over the line cap on its own gets a batch to itself, since no batch could hold it under the cap.
export const packBatches = (files: ReviewFile[], fileCap: number, lineCap: number): ReviewFile[][] => {
  const batches: ReviewFile[][] = [];
  let batch: ReviewFile[] = [];
  let batchLines = 0;
  const closeBatch = () => {
    if (batch.length > 0) batches.push(batch);
    batch = [];
    batchLines = 0;
  };
  for (const file of files) {
    if (file.lines > lineCap) {
      closeBatch();
      batches.push([file]);
      continue;
    }
    if (batch.length >= fileCap || batchLines + file.lines > lineCap) closeBatch();
    batch.push(file);
    batchLines += file.lines;
  }
  closeBatch();
  return batches;
};
