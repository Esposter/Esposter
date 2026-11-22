// The name a batch file is written under, its number padded to two digits so the names sort in the order they were cut
export const formatBatchFileName = (index: number, extension: string): string =>
  `${String(index + 1).padStart(2, "0")}${extension}`;
