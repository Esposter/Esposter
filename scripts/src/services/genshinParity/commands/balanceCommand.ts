import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { readDisplaySamples } from "#src/services/genshinParity/display/readDisplaySamples";
import { solveWhiteBalance } from "#src/services/genshinParity/display/solveWhiteBalance";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { parseNames } from "#src/services/shared/parseNames";
import { defineCommand } from "citty";
import { GENSHIN_TONE_CONTRAST } from "genshin-engine";
import { Matrix3 } from "three";

export const balanceCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description: "References' ids in ParityReferenceMap at one hour, separated by commas",
      required: true,
      type: "positional",
    },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Solve an hour's white balance before the tone curve where the stone's light lies flattest over every reference given, each pixel's colour taken back through its inverse, those under the curve's black among them",
    name: "balance",
  },
  run: async ({ args }) => {
    await fetchReferences();
    const referenceIds = parseNames(args.reference, "reference");
    const samples: DisplaySample[] = [];
    for (const referenceId of referenceIds) {
      // A channel under the curve's black is what the balance shows in, so every pixel shown over none is read
      // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
      const referenceSamples = await readDisplaySamples(referenceId, args.witness, 0);
      console.log(`${referenceId}: ${referenceSamples.length} pixels`);
      samples.push(...referenceSamples);
    }
    const { residual, whiteBalance } = await solveWhiteBalance(samples);
    console.log(
      `temperature ${whiteBalance.temperature.toFixed(1)}, tint ${whiteBalance.tint.toFixed(1)}: residual ${residual.toExponential(3)}, against ${computeLightPlaneResidual(samples, GENSHIN_TONE_CONTRAST, new Matrix3()).toExponential(3)} under none`,
    );
  },
});
