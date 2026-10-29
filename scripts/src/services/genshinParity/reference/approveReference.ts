import { ParityReportRun } from "#src/models/genshinParity/reference/ParityReportRun";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { decideApprovalStatus } from "#src/services/genshinParity/reference/decideApprovalStatus";
import { getApprovalValue } from "#src/services/genshinParity/reference/getApprovalValue";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { readScore } from "#src/services/genshinParity/reference/readScore";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import { GENSHIN_WORLD_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { getReferencePath } from "#src/services/genshinParity/shared/getReferencePath";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import {
  APPROVE_ENVIRONMENT_VARIABLE,
  FIXTURE_VARIANT_SEPARATOR,
  getFixtureImageName,
} from "genshin-interface/constants";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The visual suite's file, whose tests are titled by their screen's name
const VISUAL_SUITE_FILE = "parity/screens.visual.ts";
// How many separate runs of the suite an image must come out of identically before it is written
const APPROVE_RUN_COUNT = 3;

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
  // A reference the manifest holds is read from its committed file, and a missing one stops the approve. It names the path
  // To add, so no image is written against a reference it cannot read
  if (hasReference) await getReferencePath(referenceId);
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
  const componentsDirectory = join(GENSHIN_WORLD_DIRECTORY, "src", "components");
  const row = (await listFixtureScreens(componentsDirectory, ParityReferenceMap, new Map())).find(
    ({ name, variant: rowVariant }) => name === reference.screen && rowVariant === (variant ?? ""),
  );
  if (!row) throw new InvalidOperationError(Operation.Read, testName, "no fixture variant of that name");
  const imagePath = join(componentsDirectory, row.directory, `${getFixtureImageName(row.variant)}.png`);
  const previousImage = existsSync(imagePath) ? readFileSync(imagePath) : undefined;
  // Each run is its own process, and the suite takes the image as the first frame it settles on, so a render that is not
  // Settled across runs writes a different image each time: the image is written only when every run wrote the same bytes
  const renders: Buffer[] = [];
  for (let run = 0; run < APPROVE_RUN_COUNT; run++) {
    // The suite's `-u` writes only the tests the filter selects, so no other screen's image moves
    const { status } = spawnSync(
      PNPM_FILE,
      // The filter is one token ending the title: pnpm hands its arguments to cmd, which splits a space and eats a caret
      [...PNPM_ARGS, "test:visual", "--run", "-u", VISUAL_SUITE_FILE, "-t", `${testName}$`],
      {
        cwd: GENSHIN_WORLD_DIRECTORY,
        env: { ...process.env, [APPROVE_ENVIRONMENT_VARIABLE]: "true" },
        stdio: "inherit",
      },
    );
    if (status !== 0) throw new InvalidOperationError(Operation.Update, testName, `the visual suite exited ${status}`);
    renders.push(readFileSync(imagePath));
  }
  if (renders.some((render) => !render.equals(renders[0]))) {
    if (previousImage === undefined) rmSync(imagePath, { force: true });
    else writeFileSync(imagePath, previousImage);
    throw new InvalidOperationError(
      Operation.Update,
      testName,
      `its render differs between ${APPROVE_RUN_COUNT} runs of the visual suite, so no image was written (the render is not settled)`,
    );
  }
  console.log(`wrote the image of ${testName}`);
};
