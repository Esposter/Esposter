import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CLOUD_ELEVATION_BANDS } from "#src/services/genshinParity/constants";
import { solveReferenceCloudCover } from "#src/services/genshinParity/solveReferenceCloudCover";
import { parseNames } from "#src/services/shared/parseNames";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const coverCommand: SubCommandsDef[string] = defineCommand({
  args: {
    heights: {
      default: false,
      description: "Also solve the heights each band's clouds stand between, one scene's for every reference given",
      type: "boolean",
    },
    reference: {
      description: "References' ids in ParityReferenceMap, separated by commas",
      required: true,
      type: "positional",
    },
    rounds: {
      default: "2",
      description: "How many times the heights and the shares are solved by turns",
      type: "string",
    },
    witness: { description: "The component whose exports mark the sky's pixels", required: true, type: "string" },
  },
  meta: {
    description:
      "The share of each cloud band the scene should draw at each reference's hour, and with --heights the heights each band stands between, solved on the sky's cover band by band of its height over the horizon",
    name: "cover",
  },
  run: async ({ args }) => {
    const roundCount = Number(args.rounds);
    if (args.rounds.trim() === "" || !Number.isInteger(roundCount) || roundCount < 0)
      throw new InvalidOperationError(Operation.Read, "rounds", `${args.rounds} is not a count`);
    const { heights, references, residual } = await solveReferenceCloudCover(
      parseNames(args.reference, "reference"),
      parseDerivedAssetComponent(args.witness),
      { isHeightSolved: args.heights, roundCount },
    );
    if (args.heights)
      console.log(
        `heights: ${Object.entries(heights)
          .map(([band, [low, high]]) => `${band} ${low.toFixed(1)} to ${high.toFixed(1)} m`)
          .join(", ")}`,
      );
    for (const { covers, ours, reference, referenceId, residual: referenceResidual } of references) {
      console.log(
        `${referenceId}: ${Object.entries(covers)
          .map(([band, cover]) => `${band} ${cover.toFixed(2)}`)
          .join(", ")}`,
      );
      for (const [band, top] of CLOUD_ELEVATION_BANDS.slice(1).entries())
        console.log(
          `  ${CLOUD_ELEVATION_BANDS[band]} to ${top} degrees: ${((ours[band] ?? 0) * 100).toFixed(1)}% against ${((reference[band] ?? 0) * 100).toFixed(1)}%`,
        );
      console.log(`  residual ${referenceResidual.toFixed(3)} of the sky's cover`);
    }
    console.log(`residual ${residual.toFixed(3)} of the sky's cover over every reference`);
  },
});
