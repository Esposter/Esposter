import { KNOWN_HOME_LINES } from "./getDiskScanRefusal";

export const getDenyReason = (scanName: string): string =>
  [
    `Refused: ${scanName} scans from a root or a home folder, which reads the whole disk for a file whose home is known, and costs minutes of CPU and disk for every agent running. Look where the file lives instead:`,
    ...KNOWN_HOME_LINES,
  ].join("\n");
