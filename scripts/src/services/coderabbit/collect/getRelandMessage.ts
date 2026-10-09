import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";

// The message a held commit's re-land is committed under: its own, less every "(cherry picked from commit …)" line —
// Each names a sha the held branch carries, and a commit naming one is owed nowhere while that branch stands — and less
// Its `Express:` claim, so a window carries it in queue order rather than the lane, which may be what could not
export const getRelandMessage = (body: string): string =>
  body
    .split("\n")
    .filter((line) => getPortedShas(line).size === 0 && getTrailerValues(line, EXPRESS_TRAILER).length === 0)
    .join("\n")
    .trimEnd();
