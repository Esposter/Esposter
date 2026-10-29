import type { SubCommandsDef } from "citty";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
import { getReferenceManifestProblems } from "#src/services/genshinParity/reference/getReferenceManifestProblems";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { verifyReferences } from "#src/services/genshinParity/reference/verifyReferences";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { defineCommand } from "citty";

export const verifyCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Cut each recorded reference's frame from its recording and check the reference against it; exits 1 when one is over tolerance",
    name: "verify",
  },
  run: async () => {
    const rows = await readReferenceManifest();
    // A reference the manifest does not hold is skipped, since there is no stored image to check
    const verifications = await verifyReferences(ParityReferenceMap, CAPTURES_DIRECTORY, async (referenceId) =>
      rows.some(({ id }) => id === referenceId) ? getReferencePath(referenceId) : undefined,
    );
    const countOf = (outcome: VerifyOutcome): number =>
      verifications.filter((verification) => verification.outcome === outcome).length;
    for (const { id, message, outcome } of verifications)
      if (outcome !== VerifyOutcome.NotCheckable) console.log(`${outcome}  ${id}  ${message}`);
    // A wiki reference has no recording to cut, so the wiki-titled ones are named once rather than line by line
    const notCheckable = verifications
      .filter(({ outcome }) => outcome === VerifyOutcome.NotCheckable)
      .map(({ id }) => id);
    if (notCheckable.length > 0) console.log(`${VerifyOutcome.NotCheckable}  ${notCheckable.join(", ")}`);
    // The manifest is checked against the map without the network. A row names an id the map names, and its plate and
    // clean plate are the ones its entry gives. Each stored image's own hash is checked when it is fetched
    const manifestProblems = getReferenceManifestProblems(rows, ParityReferenceMap);
    for (const problem of manifestProblems) console.log(`${VerifyOutcome.Fail}  manifest  ${problem}`);
    console.log(
      `${countOf(VerifyOutcome.Pass)} pass, ${countOf(VerifyOutcome.Fail) + manifestProblems.length} fail, ${countOf(VerifyOutcome.Skipped)} skipped`,
    );
    if (countOf(VerifyOutcome.Fail) > 0 || manifestProblems.length > 0) process.exitCode = 1;
  },
});
