import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { WITNESS_LAYOUT_FILE_NAME } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { compareScreen } from "#src/services/genshinParity/reference/compareScreen";
import { getLayerComponent } from "#src/services/genshinParity/reference/getLayerComponent";
import { getMissingReferenceInputs } from "#src/services/genshinParity/reference/getMissingReferenceInputs";
import { writeParityScores } from "#src/services/genshinParity/reference/writeParityScores";
import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const compareCommand: SubCommandsDef[string] = defineCommand({
  args: {
    all: {
      description: "Compare every reference in turn, one whose inputs are not on disk yet reported as not measured",
      type: "boolean",
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
      "Shoot a reference's screen, print the scores, write reference, ours and difference, and update its row of the report",
    name: "compare",
  },
  run: async ({ args }) => {
    const referenceIds = args.all ? Object.keys(ParityReferenceMap) : [args.reference ?? ""];
    const scores: Record<string, ParityScore> = {};
    // Fetched first, as each comparison would fetch it, so a reference the wiki holds is measured rather than reported
    if (args.all) await fetchReferences();
    // One screen is shot at a time, on the one parity page
    for (const referenceId of referenceIds) {
      if (args.all) {
        console.log(`== ${referenceId}`);
        const layerComponent = getLayerComponent(referenceId, args.witness);
        const witnessLayoutPath =
          layerComponent === undefined
            ? undefined
            : join(getComponentDirectory(layerComponent).root, WITNESS_LAYOUT_FILE_NAME);
        const missing = getMissingReferenceInputs(
          join(REFERENCES_DIRECTORY, `${referenceId}.png`),
          witnessLayoutPath,
          existsSync,
        );
        // A reference not yet measurable keeps its row as the report last had it, and the run goes on to the next
        if (missing.length > 0) {
          console.log(`not measured: ${missing.join(", ")}`);
          continue;
        }
      }
      // oxlint-disable-next-line no-await-in-loop -- the parity page shoots one screen at a time
      scores[referenceId] = await compareScreen(referenceId, args.witness);
    }
    // A witness's scores price the exports, not the scene, so the committed report keeps the scene's own
    if (!args.witness) await writeParityScores(scores);
  },
});
