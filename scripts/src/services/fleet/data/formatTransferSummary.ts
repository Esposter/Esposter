import { MEBIBYTE } from "#src/services/shared/constants";
import { MILLISECONDS_PER_SECOND } from "@esposter/shared";

// The line a transfer ends with: its file count, its bytes in mebibytes, its duration and its throughput
export const formatTransferSummary = (fileCount: number, bytes: number, milliseconds: number): string => {
  const mebibytes = bytes / MEBIBYTE;
  const seconds = milliseconds / MILLISECONDS_PER_SECOND;
  return `${fileCount} files, ${mebibytes.toFixed(1)} MiB in ${seconds.toFixed(1)} s, ${(mebibytes / seconds).toFixed(1)} MiB/s`;
};
