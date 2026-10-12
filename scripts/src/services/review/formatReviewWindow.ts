import type { ReviewWindow } from "#src/models/review/ReviewWindow";

// The window as the dry run prints it, and the run logs it before reviewing: its base and end, its commits and its
// Batches with their file and line counts.
export const formatReviewWindow = ({ base, batches, commitShas, end, owedAfter }: ReviewWindow): string => {
  const fileCount = batches.reduce((total, batch) => total + batch.length, 0);
  const lines = [
    `window: ${commitShas.length} commit(s), ${fileCount} file(s) in ${batches.length} batch(es)`,
    `base: ${base}`,
    `end: ${end}`,
    `owed after this window: ${owedAfter} commit(s)`,
  ];
  for (const [index, batch] of batches.entries()) {
    const lineCount = batch.reduce((total, file) => total + file.lines, 0);
    lines.push(`batch ${index + 1}: ${batch.length} file(s), ${lineCount} line(s)`);
    for (const file of batch) lines.push(`  ${file.path} (${file.lines})`);
  }
  return lines.join("\n");
};
