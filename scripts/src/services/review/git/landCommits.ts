import { LAND_ATTEMPTS } from "#src/services/review/constants";
import { tryLand } from "#src/services/review/git/tryLand";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// Lands the fixer's commits, up to `LAND_ATTEMPTS` times. Returns whether they landed.
export const landCommits = (cwd: string = REPOSITORY_ROOT): boolean =>
  Array.from({ length: LAND_ATTEMPTS }).some(() => tryLand(cwd));
