import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { decideApprovalStatus } from "#src/services/genshinParity/reference/decideApprovalStatus";
import { getApprovalValue } from "#src/services/genshinParity/reference/getApprovalValue";
import { readScore } from "#src/services/genshinParity/reference/readScore";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import { GENSHIN_WORLD_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { FIXTURE_VARIANT_SEPARATOR } from "genshin-interface/constants";

// The visual suite's file, whose tests are titled by their screen's name
const VISUAL_SUITE_FILE = "parity/screens.visual.ts";

// Writes a screen's image as a snapshot of its current render, and prints its compare's status against the bar beside it.
// No status stops the image: a missing reference, a failed compare or a reference judging less than the whole screen is
// Printed as such, and the score is recorded wherever a whole-screen compare ran. The compare judges the state the map
// Records for the reference, so a variant's score is only ever its own reference's
export const approveReference = async (referenceId: string, variant?: string): Promise<void> => {
  const reference = ParityReferenceMap[referenceId];
  if (!reference)
    throw new InvalidOperationError(
      Operation.Read,
      referenceId,
      `not one of ${Object.keys(ParityReferenceMap).join(", ")}`,
    );
  await fetchReferences();
  const hasReference = (await readReferenceManifest()).some(({ id }) => id === referenceId);
  // A region compare judges only the region it names. The compare also judges the props and variant the map records, so
  // A base image over a reference in other props, or a variant the map does not record, is judged by no compare at all
  const isRecordedState =
    variant === undefined
      ? reference.props === undefined && reference.variant === undefined
      : variant === reference.variant;
  const isWholeScreen = reference.region === undefined && isRecordedState;
  const score = hasReference && isWholeScreen ? await readScore(referenceId) : undefined;
  // The committed report takes the compare's row whether or not it clears the bar, as `compare` writes it
  if (score) await writeParityScores({ [referenceId]: score }, ParityReportRun.Subset);
  const approval = reference.approval ?? DEFAULT_APPROVAL;
  const approvalStatus = decideApprovalStatus(hasReference, isWholeScreen, score, approval);
  const value = score === undefined ? undefined : getApprovalValue(score, approval);
  const barSource =
    reference.approval === undefined
      ? "the global default, no bar recorded for this screen"
      : "recorded for this screen";
  console.log(
    value === undefined
      ? `${referenceId}: ${approvalStatus}`
      : `${referenceId}: ${approvalStatus} (${approval.measure} ${value.toFixed(4)} against the bar ${approval.bar}, ${barSource})`,
  );
  const testName =
    variant === undefined ? reference.screen : `${reference.screen}${FIXTURE_VARIANT_SEPARATOR}${variant}`;
  // The suite's `-u` writes only the tests the filter selects, so no other screen's image moves
  const { status } = spawnSync(
    PNPM_FILE,
    // The filter is one token ending the title: pnpm hands its arguments to cmd, which splits a space and eats a caret
    [...PNPM_ARGS, "test:visual", "--run", "-u", VISUAL_SUITE_FILE, "-t", `${testName}$`],
    { cwd: GENSHIN_WORLD_DIRECTORY, stdio: "inherit" },
  );
  if (status !== 0) throw new InvalidOperationError(Operation.Update, testName, `the visual suite exited ${status}`);
  console.log(`wrote the image of ${testName}`);
};
