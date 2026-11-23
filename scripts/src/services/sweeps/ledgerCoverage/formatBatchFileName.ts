// The name a batch file is written under: its number padded to the digits the count of batches needs, and to at least
// Two, so the names of one run sort in the order they were cut
export const formatBatchFileName = (index: number, count: number, extension: string): string =>
  `${String(index + 1).padStart(Math.max(2, String(count).length), "0")}${extension}`;
