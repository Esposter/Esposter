import { checkIsContainedPath } from "#src/services/fleet/data/checkIsContainedPath";
import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { win32 } from "node:path";

// Whether a path names a provenance stamp inside the parity directory: a folder's `provenance.json` or a file's sidecar,
// Relative, and never leaving the directory, as `checkIsContainedPath` judges it
export const checkIsStampPath = (path: string): boolean => {
  const name = win32.basename(path);
  return checkIsContainedPath(path) && (name === PROVENANCE_NAME || name.endsWith(PROVENANCE_SIDECAR_SUFFIX));
};
