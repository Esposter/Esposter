import type { ReferenceVerification } from "#src/models/genshinParity/reference/ReferenceVerification";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { REFERENCE_PACK_CONCURRENCY } from "#src/services/genshinParity/reference/constants";
import { verifyReference } from "#src/services/genshinParity/reference/verifyReference";
import { settleAll, withFinalizerAsync } from "@esposter/shared";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Verifies every reference of a map with a recording source, each against the frame its source names, cut into one
// Temporary folder that is removed after. A wiki reference has no recording to cut, so it is reported as not checkable;
// A pending one, with neither a source nor a wiki title, is left out. The cuts block on FFmpeg, a few at a time
export const verifyReferences = async (
  references: Record<string, ParityReference>,
  capturesDirectory: string,
  referencePath: (referenceId: string) => Promise<string | undefined>,
): Promise<ReferenceVerification[]> => {
  const cutDirectory = await mkdtemp(join(tmpdir(), "parity-verify-"));
  return withFinalizerAsync(
    async () => {
      const verifications = await settleAll(
        Object.entries(references).map(
          ([referenceId, reference]) =>
            () =>
              Promise.try(() => {
                if (reference.source === undefined)
                  return reference.wikiTitle === undefined
                    ? undefined
                    : { id: referenceId, message: reference.wikiTitle, outcome: VerifyOutcome.NotCheckable };
                return verifyReference(referenceId, reference.source, reference, {
                  capturesDirectory,
                  cutDirectory,
                  referencePath,
                });
              }),
        ),
        REFERENCE_PACK_CONCURRENCY,
      );
      return verifications.filter((verification) => verification !== undefined);
    },
    () => rm(cutDirectory, { force: true, recursive: true }),
  );
};
