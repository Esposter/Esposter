import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ReferenceVerification } from "#src/models/genshinParity/reference/ReferenceVerification";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { verifyReference } from "#src/services/genshinParity/reference/verifyReference";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Verifies every reference of a map with a recording source, each against the frame its source names, cut into one
// Temporary folder that is removed after. A wiki reference has no recording to cut, so it is reported as not checkable;
// A pending one, with neither a source nor a wiki title, is left out. The cuts block on FFmpeg, one at a time
export const verifyReferences = async (
  references: Record<string, ParityReference>,
  capturesDirectory: string,
  referencePath: (referenceId: string) => string,
): Promise<ReferenceVerification[]> => {
  const cutDirectory = await mkdtemp(join(tmpdir(), "parity-verify-"));
  try {
    const verifications = await Promise.all(
      Object.entries(references).map(async ([referenceId, reference]) => {
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
    );
    return verifications.filter((verification) => verification !== undefined);
  } finally {
    await rm(cutDirectory, { force: true, recursive: true });
  }
};
