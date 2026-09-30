import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { attributeScene } from "#src/services/genshinParity/attributeScene";
import { writeAttribution } from "#src/services/genshinParity/writeAttribution";
import { defineCommand } from "citty";

const DEGREE = Math.PI / 180;

export const attributeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pose: {
      description:
        "A camera pose to hold, as x,y,z,yaw,pitch,fov (metres, then degrees); the scene's own camera if not",
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
    description: "Price each stand-in of a scene against the game's exports, and write its loss table",
    name: "attribute",
  },
  run: async ({ args }) => {
    const [x = 0, y = 0, z = 0, yaw = 0, pitch = 0, fov = 45] = args.pose ? args.pose.split(",").map(Number) : [];
    const camera = args.pose
      ? { fov, pitch: pitch * DEGREE, position: [x, y, z] satisfies [number, number, number], yaw: yaw * DEGREE }
      : undefined;
    const referenceIds = args.references.split(",");
    const rows = await attributeScene(referenceIds, parseDerivedAssetComponent(args.witness), camera);
    for (const { detail, lineDistance, name, shape, tone } of rows)
      console.log(
        `${name}: line ${lineDistance.toFixed(2)}, shape ${shape.toFixed(3)}, tone ${tone.toFixed(2)}%, detail ${detail.toFixed(2)}%`,
      );
    console.log(await writeAttribution(referenceIds, rows));
  },
});
