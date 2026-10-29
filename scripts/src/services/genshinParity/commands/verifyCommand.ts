import type { SubCommandsDef } from "citty";

import { VerifyOutcome } from "#src/models/genshinParity/reference/VerifyOutcome";
import { CAPTURES_DIRECTORY } from "#src/services/genshinParity/game/constants";
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
    const verifications = await verifyReferences(ParityReferenceMap, CAPTURES_DIRECTORY, getReferencePath);
    const countOf = (outcome: VerifyOutcome): number =>
      verifications.filter((verification) => verification.outcome === outcome).length;
    for (const { id, message, outcome } of verifications)
      if (outcome !== VerifyOutcome.NotCheckable) console.log(`${outcome}  ${id}  ${message}`);
    // A wiki reference has no recording to cut, so the wiki-titled ones are named once rather than line by line
    const notCheckable = verifications
      .filter(({ outcome }) => outcome === VerifyOutcome.NotCheckable)
      .map(({ id }) => id);
    if (notCheckable.length > 0) console.log(`${VerifyOutcome.NotCheckable}  ${notCheckable.join(", ")}`);
    console.log(
      `${countOf(VerifyOutcome.Pass)} pass, ${countOf(VerifyOutcome.Fail)} fail, ${countOf(VerifyOutcome.Skipped)} skipped`,
    );
    if (countOf(VerifyOutcome.Fail) > 0) process.exitCode = 1;
  },
});
