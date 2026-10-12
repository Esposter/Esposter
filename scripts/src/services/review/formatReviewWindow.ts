import type { ReviewWindow } from "#src/models/review/ReviewWindow";

// One window as the run logs it and the dry run prints it: its index, its base and end, its commits and its batches with
// Their file and line counts.
export const formatReviewWindow = ({ base, batches, commitShas, end }: ReviewWindow, index: number): string => {
  const fileCount = batches.reduce((total, batch) => total + batch.length, 0);
  const lines = [
    `window ${index}: ${commitShas.length} commit(s), ${fileCount} file(s) in ${batches.length} batch(es)`,
    `base: ${base}`,
    `end: ${end}`,
  ];
  for (const [batchIndex, batch] of batches.entries()) {
    const lineCount = batch.reduce((total, file) => total + file.lines, 0);
    lines.push(`batch ${batchIndex + 1}: ${batch.length} file(s), ${lineCount} line(s)`);
    for (const file of batch) lines.push(`  ${file.path} (${file.lines})`);
  }
  return lines.join("\n");
};
