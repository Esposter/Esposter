import { getSizeBand } from "#src/services/getSizeBand";
import { statSync } from "node:fs";
import { basename, resolve } from "node:path";

// The line every package's bundle-size suite snapshots: the band the file's size sits in, not its exact bytes, so a
// change of a few kilobytes leaves the snapshot as it is, and only growth past the band's top (or a shrink below it)
// moves it. Two snapshots that moved are compared by reading their bands, which is why the unit is fixed at KB
export const getFileSizeReport = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const { size } = statSync(absolutePath);
  return `${basename(absolutePath)}: up to ${getSizeBand(size)} KB`;
};
