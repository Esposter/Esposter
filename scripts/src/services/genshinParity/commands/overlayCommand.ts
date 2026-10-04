import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { readReferenceGbuffer } from "#src/services/genshinParity/readReferenceGbuffer";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";
import { writeOverlay } from "#src/services/genshinParity/writeOverlay";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

export const overlayCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pose: {
      description: `A pose in place of the reference's, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      type: "string",
    },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Draw the witness's family boundaries over a reference, coloured by family, beside the reference's edges coloured by their distance from them, and print each family's distance from the reference's edges",
    name: "overlay",
  },
  run: async ({ args }) => {
    const { gbuffer, image } = await readReferenceGbuffer(
      args.reference,
      args.witness,
      args.pose ? toPageCamera(parseNumbers(args.pose, "pose", CAMERA_POSE_AXES.length)) : undefined,
    );
    const { families, path } = await writeOverlay(args.reference, { gbuffer, image });
    for (const { distance, name, pixelCount } of families)
      console.log(`${name}: ${distance.toFixed(2)} px from the reference's edges over ${pixelCount} boundary pixels`);
    console.log(`overlay | edge distance: ${path}`);
  },
});
