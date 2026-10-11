import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ApprovalOutcome } from "#src/models/genshinParity/reference/ApprovalOutcome";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { decideApproval } from "#src/services/genshinParity/reference/decideApproval";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import {
  APPROVAL_FLIP_BAR,
  GENSHIN_WORLD_DIRECTORY,
  REFERENCES_DIRECTORY,
  VISUAL_VARIANT_SEPARATOR,
} from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The visual suite's file and its describe, whose tests are titled by their screen's name
const VISUAL_SUITE_FILE = "parity/screens.visual.ts";
const VISUAL_SUITE_TITLE = "interface screens";

const readScore = async (referenceId: string): Promise<ParityScore | undefined> =>
  (await getResultAsync(() => compareScreen(referenceId))).match(
    (score) => score,
    (error) => {
      console.log(`failed: ${error.message}`);
      return undefined;
    },
  );

// Approves a screen's image: its compare against the stored reference must score under the bar, and only then is the
// Visual suite run with `-u` for that one screen (its base image, or the variant's named by `variant`). A reference
// Missing from disk is fetched first, and any refusal throws before the image is written. A variant is approved against
// The reference it is given, so that reference must be the variant's own state, which the reference map does not record
export const approveReference = async (referenceId: string, variant?: string): Promise<void> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `not one of ${Object.keys(ParityReferenceMap).join(", ")}`,
    );
  await fetchReferences();
  const hasReference = existsSync(join(REFERENCES_DIRECTORY, `${referenceId}.png`));
  // A region compare judges only the region it names, and a reference with props of its own judges another state than
  // The base image draws. Neither is compared: a variant's reference is the variant's state, which only its caller knows
  const isWholeScreen = reference.region === undefined && (variant !== undefined || reference.props === undefined);
  const score = hasReference && isWholeScreen ? await readScore(referenceId) : undefined;
  // The committed report takes the compare's row whether or not it clears the bar, as `compare` writes it
  if (score) await writeParityScores({ [referenceId]: score });
  const outcome = decideApproval(hasReference, isWholeScreen, score, APPROVAL_FLIP_BAR);
  console.log(
    `${referenceId}: ${score ? `FLIP ${score.flip.toFixed(4)}` : "no score"} against the bar ${APPROVAL_FLIP_BAR}`,
  );
  if (outcome !== ApprovalOutcome.Approved)
    throw new InvalidOperationError(Operation.Update, referenceId, `not approved: ${outcome}`);
  const testName =
    variant === undefined ? reference.screen : `${reference.screen}${VISUAL_VARIANT_SEPARATOR}${variant}`;
  // The suite's `-u` writes only the tests the filter selects, so no other screen's image moves
  const { status } = spawnSync(
    PNPM_FILE,
    [...PNPM_ARGS, "test:visual", "--run", "-u", VISUAL_SUITE_FILE, "-t", `^${VISUAL_SUITE_TITLE} ${testName}$`],
    { cwd: GENSHIN_WORLD_DIRECTORY, stdio: "inherit" },
  );
  if (status !== 0) throw new InvalidOperationError(Operation.Update, testName, `the visual suite exited ${status}`);
  console.log(`approved ${testName}`);
};
