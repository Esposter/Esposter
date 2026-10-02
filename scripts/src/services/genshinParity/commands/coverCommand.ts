import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CLOUD_ELEVATION_BANDS } from "#src/services/genshinParity/constants";
import { solveReferenceCloudCover } from "#src/services/genshinParity/solveReferenceCloudCover";
import { defineCommand } from "citty";

export const coverCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: { description: "The component whose exports mark the sky's pixels", required: true, type: "string" },
  },
  meta: {
    description:
      "The share of each cloud band the scene should draw at the reference's hour, solved on the sky's cover band by band of its height over the horizon",
    name: "cover",
  },
  run: async ({ args }) => {
    const { covers, ours, reference, residual } = await solveReferenceCloudCover(
      args.reference,
      parseDerivedAssetComponent(args.witness),
    );
    console.log(
      Object.entries(covers)
        .map(([band, cover]) => `${band} ${cover.toFixed(2)}`)
        .join(", "),
    );
    for (const [band, top] of CLOUD_ELEVATION_BANDS.slice(1).entries())
      console.log(
        `${CLOUD_ELEVATION_BANDS[band]} to ${top} degrees: ${((ours[band] ?? 0) * 100).toFixed(1)}% against ${((reference[band] ?? 0) * 100).toFixed(1)}%`,
      );
    console.log(`residual ${residual.toFixed(3)} of the sky's cover`);
  },
});
