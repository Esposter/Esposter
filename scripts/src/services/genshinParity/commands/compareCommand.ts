import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ComparisonFailureRecovery } from "#src/models/genshinParity/reference/ComparisonFailureRecovery";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { startFreshPageServer } from "#src/services/genshinParity/page/startFreshPageServer";
import { classifyComparisonFailure } from "#src/services/genshinParity/reference/classifyComparisonFailure";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { DEFAULT_APPROVAL } from "#src/services/genshinParity/reference/constants";
import { getLayerComponent } from "#src/services/genshinParity/reference/getLayerComponent";
import { getMissingReferenceInputs } from "#src/services/genshinParity/reference/getMissingReferenceInputs";
import { getWorstCells } from "#src/services/genshinParity/reference/getWorstCells";
import { readCachedReference } from "#src/services/genshinParity/reference/readCachedReference";
import { readReferenceManifest } from "#src/services/genshinParity/reference/readReferenceManifest";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { roundHundredths } from "#src/services/genshinParity/shared/roundHundredths";
import { parseWholeCount } from "#src/services/shared/parseWholeCount";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";
import { defineCommand } from "citty";
import { WITNESS_LAYOUT_FILE_NAME } from "genshin-world/sceneExport";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The worst cells a comparison names by default, the grid's most-differing cells
const DEFAULT_CELL_COUNT = "10";

export const compareCommand: SubCommandsDef[string] = defineCommand({
  args: {
    all: {
      description: "Compare every reference in turn, one whose inputs are not on disk yet reported as not measured",
      type: "boolean",
    },
    cells: {
      default: DEFAULT_CELL_COUNT,
      description: "How many of the grid's worst cells the JSON line of each comparison names",
      required: false,
      type: "string",
    },
    reference: { description: "A reference's id in ParityReferenceMap", required: false, type: "positional" },
    witness: {
      description: "A component whose exports the scene draws in place of its own parts; scored apart from the report",
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Shoot a reference's screen, print its worst cells as one JSON line, write reference, ours and difference, and update its row of the report",
    name: "compare",
  },
  run: async ({ args }) => {
    const cellCount = parseWholeCount(args.cells, "cells", 1);
    const referenceIds = args.all ? Object.keys(ParityReferenceMap) : [args.reference ?? ""];
    const scores: Record<string, ParityScore> = {};
    // A page that predates a build of its packages is replaced for this run alone, and the replacement stopped when the run ends
    const freshPage = await startFreshPageServer();
    const pageRoot = freshPage === undefined ? undefined : `${freshPage.origin}/parity/`;
    await withFinalizerAsync(
      async () => {
        // Fetched first, as each comparison would fetch it, so a reference the wiki holds is measured rather than reported
        if (args.all) await fetchReferences();
        // Read once for the run: the held check and each held reference's path come from its row
        const manifestRows = args.all ? await readReferenceManifest() : [];
        // One screen is shot at a time, on the one parity page
        for (const referenceId of referenceIds) {
          if (args.all) console.error(`== ${referenceId}`);
          // A pending screen names no reference to score, so the run says why it is unscored and goes on
          const pending = ParityReferenceMap[referenceId]?.pending;
          if (pending !== undefined) {
            console.error(`pending: ${pending}`);
            continue;
          }
          if (args.all) {
            const layerComponent = getLayerComponent(referenceId, args.witness);
            const witnessLayoutPath =
              layerComponent === undefined
                ? undefined
                : join(getComponentDirectory(layerComponent).root, WITNESS_LAYOUT_FILE_NAME);
            // A reference the manifest does not hold has no stored image to measure, so it is named missing rather than fetched
            const row = manifestRows.find(({ id }) => id === referenceId);
            const missing =
              row === undefined
                ? ["reference image in the manifest"]
                : getMissingReferenceInputs(await readCachedReference(row.sha256), witnessLayoutPath, existsSync);
            // A reference not yet measurable keeps its row as the report last had it, and the run goes on to the next
            if (missing.length > 0) {
              console.error(`not measured: ${missing.join(", ")}`);
              continue;
            }
          }
          // oxlint-disable-next-line no-await-in-loop -- the parity page shoots one screen at a time
          const comparisonResult = await getResultAsync(() => compareScreen(referenceId, args.witness, pageRoot));
          comparisonResult.match(
            ({ cells, score }) => {
              scores[referenceId] = score;
              // The last stdout line of a comparison: its score against its bar and the worst cells of its grid
              console.log(
                JSON.stringify({
                  bar: (ParityReferenceMap[referenceId]?.approval ?? DEFAULT_APPROVAL).bar,
                  id: referenceId,
                  score: roundHundredths(score.meanDifference),
                  worst: getWorstCells(cells, cellCount),
                }),
              );
            },
            (error) => {
              // A named reference fails the command as it always did, while `--all` reports the failure and goes on
              if (!args.all) throw error;
              console.error(`failed: ${error.message}`);
              // Each reference's finalizers close its page, so the next one opens a page of its own, and a browser that
              // Closed is replaced by the browser that page opens in
              if (classifyComparisonFailure(error.message) === ComparisonFailureRecovery.RelaunchAndContinue)
                console.error("the browser closed, so the next reference opens its page on a fresh one");
            },
          );
        }
      },
      () => freshPage?.stop(),
    );
    // A witness's scores price the exports, not the scene, so the committed report keeps the scene's own
    if (!args.witness) await writeParityScores(scores);
  },
});
