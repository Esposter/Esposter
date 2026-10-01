import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { attributeScene } from "#src/services/genshinParity/attributeScene";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";
import { writeAttribution } from "#src/services/genshinParity/writeAttribution";
import { defineCommand } from "citty";

export const attributeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pose: {
      description: `A camera pose to hold, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees); the scene's own camera if not`,
      type: "string",
    },
    references: {
      description:
        "The ids in ParityReferenceMap of the references to score against, comma separated, sharing one pose",
      required: true,
      type: "positional",
    },
    witness: { description: "The component whose exports the witness draws", required: true, type: "string" },
  },
  meta: {
    description:
      "Price each stand-in of a scene against the game's exports layer by layer, and write its loss table, each layer's FLIP loss beside the witness's",
    name: "attribute",
  },
  run: async ({ args }) => {
    const referenceIds = args.references.split(",");
    const rows = await attributeScene(
      referenceIds,
      parseDerivedAssetComponent(args.witness),
      args.pose ? toPageCamera(args.pose.split(",").map(Number)) : undefined,
    );
    for (const { layers, name } of rows)
      for (const { detail, flip, name: layer, shape, tone } of layers)
        console.log(
          `${name}, ${layer}: shape ${shape.toFixed(3)}, tone ${tone.toFixed(2)}%, detail ${detail.toFixed(2)}%, FLIP ${flip.toFixed(4)}`,
        );
    console.log(await writeAttribution(referenceIds, rows));
  },
});
