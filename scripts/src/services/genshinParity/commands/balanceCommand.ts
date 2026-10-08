import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";
import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { computeLightPlaneResidual } from "#src/services/genshinParity/display/computeLightPlaneResidual";
import { UNDER_BLACK_BAND_COUNT } from "#src/services/genshinParity/display/constants";
import { readDisplaySamples } from "#src/services/genshinParity/display/readDisplaySamples";
import { readUnderBlackShares } from "#src/services/genshinParity/display/readUnderBlackShares";
import { solveUnderBlackBalance } from "#src/services/genshinParity/display/solveUnderBlackBalance";
import { solveWhiteBalance } from "#src/services/genshinParity/display/solveWhiteBalance";
import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { readReferenceStoneSamples } from "#src/services/genshinParity/witness/readReferenceStoneSamples";
import { parseNames } from "#src/services/shared/parseNames";
import { defineCommand } from "citty";
import { computeWhiteBalance, GENSHIN_TONE_CONTRAST } from "genshin-engine";
import { Matrix3 } from "three";

// A share of each channel as percentages, red, green and blue
const formatShare = (share: number): string => `${(share * 100).toFixed(1)}%`;
const formatShares = (shares: Vector): string => shares.map((share) => formatShare(share)).join(" ");

export const balanceCommand: SubCommandsDef[string] = defineCommand({
  args: {
    black: {
      default: false,
      description:
        "Solve by the stone's share under the curve's black instead: under each candidate the light solved again over every reference's stone, the balance whose light takes as much of it under the black, channel by channel, as each reference shows",
      type: "boolean",
    },
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
    if (args.black) {
      const references: StoneLightSample[][] = [];
      let pageBalance = new Matrix3();
      for (const referenceId of referenceIds) {
        // oxlint-disable-next-line no-await-in-loop -- one browser is open at a time
        const { samples, whiteBalance } = await readReferenceStoneSamples(referenceId, args.witness);
        references.push(samples);
        pageBalance = whiteBalance;
      }
      const logShares = (label: string, matrix: Matrix3): void => {
        for (const [index, [shares]] of readUnderBlackShares(references, matrix).entries())
          if (shares)
            console.log(
              `  ${referenceIds[index]} ${label}: ours ${formatShares(shares.ours)} against ${formatShares(shares.reference)} of ${references[index]?.length ?? 0} pixels`,
            );
      };
      logShares("under the page's balance", pageBalance);
      for (const [label, solved] of [
        ["every reference", references],
        ...references.map((samples, index) => [referenceIds[index] ?? "", [samples]] as const),
      ] as const) {
        // oxlint-disable-next-line no-await-in-loop -- each solve is printed as it ends
        const { cost, whiteBalance } = await solveUnderBlackBalance(solved, { temperature: 0, tint: 0 });
        console.log(
          `over ${label}: temperature ${whiteBalance.temperature.toFixed(1)}, tint ${whiteBalance.tint.toFixed(1)}, cost ${cost.toExponential(3)}`,
        );
        const matrix = computeWhiteBalance(whiteBalance, new Matrix3());
        logShares("under it", matrix);
        for (const [index, bands] of readUnderBlackShares(references, matrix, UNDER_BLACK_BAND_COUNT).entries())
          console.log(
            `  ${referenceIds[index]} red by its green, darkest first: ours ${bands.map(({ ours }) => formatShare(ours[0])).join(" ")} against ${bands.map(({ reference }) => formatShare(reference[0])).join(" ")}`,
          );
      }
      return;
    }
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
