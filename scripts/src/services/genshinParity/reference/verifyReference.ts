import type { ReferenceVerification } from "#src/models/genshinParity/reference/ReferenceVerification";
import type { VerifyPaths } from "#src/models/genshinParity/reference/VerifyPaths";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { checkReference } from "#src/services/genshinParity/reference/checkReference";
import { getResultAsync } from "@esposter/shared";

// A check that throws, such as an image that sharp cannot read, fails its own reference.
// Every other reference still gets its line, and the run its summary
export const verifyReference = async (
  referenceId: string,
  source: string,
  reference: ParityReference,
  paths: VerifyPaths,
): Promise<ReferenceVerification> =>
  (await getResultAsync(() => checkReference(referenceId, source, reference, paths))).match(
    (verification) => verification,
    ({ message }) => ({ id: referenceId, message: `could not be checked: ${message}`, outcome: VerifyOutcome.Fail }),
  );
