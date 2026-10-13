import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ApprovalOutcome } from "#src/models/genshinParity/reference/ApprovalOutcome";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { decideApproval } from "#src/services/genshinParity/reference/decideApproval";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import {
  DEFAULT_APPROVAL,
  GENSHIN_WORLD_DIRECTORY,
  REFERENCES_DIRECTORY,
  VISUAL_VARIANT_SEPARATOR,
} from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The visual suite's file, whose tests are titled by their screen's name
const VISUAL_SUITE_FILE = "parity/screens.visual.ts";

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
  const approval = reference.approval ?? DEFAULT_APPROVAL;
  const outcome = decideApproval(hasReference, isWholeScreen, score, approval);
  const value =
    score === undefined
      ? undefined
      : approval.measure === ParityApprovalMeasure.Flip
        ? score.flip
        : score.meanDifference;
  const barSource =
    reference.approval === undefined
      ? "the global default, no bar recorded for this screen"
      : "recorded for this screen";
  console.log(
    `${referenceId}: ${value === undefined ? "no score" : `${approval.measure} ${value.toFixed(4)}`} against the bar ${approval.bar} (${barSource})`,
  );
  if (outcome !== ApprovalOutcome.Approved)
    throw new InvalidOperationError(Operation.Update, referenceId, `not approved: ${outcome}`);
  const testName =
    variant === undefined ? reference.screen : `${reference.screen}${VISUAL_VARIANT_SEPARATOR}${variant}`;
  // The suite's `-u` writes only the tests the filter selects, so no other screen's image moves
  const { status } = spawnSync(
    PNPM_FILE,
    // The filter is one token ending the title: pnpm hands its arguments to cmd, which splits a space and eats a caret
    [...PNPM_ARGS, "test:visual", "--run", "-u", VISUAL_SUITE_FILE, "-t", `${testName}$`],
    { cwd: GENSHIN_WORLD_DIRECTORY, stdio: "inherit" },
  );
  if (status !== 0) throw new InvalidOperationError(Operation.Update, testName, `the visual suite exited ${status}`);
  console.log(`approved ${testName}`);
};
