import type { StampEntry } from "#src/models/fleet/data/StampEntry";

import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { posix } from "node:path";

// Whether the stamp at a path refuses a path: a folder's stamp refuses every path under its folder, and a file's sidecar
// Refuses the file it sits beside and the sidecar itself
const checkIsRefusedBy = (path: string, stampPath: string): boolean => {
  if (posix.basename(stampPath) === PROVENANCE_NAME) {
    const directory = posix.dirname(stampPath);
    return path.startsWith(directory === "." ? "" : `${directory}/`);
  }
  return path === stampPath || path === stampPath.slice(0, -PROVENANCE_SIDECAR_SUFFIX.length);
};

// The paths a copy may move and the ones it refuses, given the stamps that name another game version than the install's.
// With no install there is no version to disagree with, so nothing is refused
export const selectVouchedPaths = (
  paths: string[],
  stamps: StampEntry[],
  gameVersion: string | undefined,
): { refused: string[]; vouched: string[] } => {
  const unvouched =
    gameVersion === undefined ? [] : stamps.filter(({ provenance }) => !checkIsVouchedBy(provenance, gameVersion));
  const refused: string[] = [];
  const vouched: string[] = [];
  for (const path of paths)
    (unvouched.some(({ path: stampPath }) => checkIsRefusedBy(path, stampPath)) ? refused : vouched).push(path);
  return { refused, vouched };
};
