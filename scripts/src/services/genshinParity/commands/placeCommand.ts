import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { placeFamilies } from "#src/services/genshinParity/placeFamilies";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";
import { defineCommand } from "citty";

export const placeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    families: { description: "The families moved as one, comma-separated", required: true, type: "string" },
    witness: { description: "The component whose exports the witness draws", required: true, type: "string" },
    iterations: { default: "60", description: "The simplex's steps", type: "string" },
    pose: {
      description: `A pose in place of the reference's, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      type: "string",
    },
    "top-row": {
      default: "0",
      description: "The row, in the structure's pixels, above which no edge is priced",
      type: "string",
    },
  },
  meta: {
    description:
      "Solve where a group of families stands on a reference, the camera held: one offset shared by them, refined on their edges",
    name: "place",
  },
  run: async ({ args }) => {
    const { after, before, offset } = await placeFamilies(args.reference, parseDerivedAssetComponent(args.witness), {
      camera: args.pose ? toPageCamera(args.pose.split(",").map(Number)) : undefined,
      families: args.families.split(","),
      iterationCount: Number(args.iterations),
      topRow: Number(args["top-row"]),
    });
    console.log(`edges ${before.toFixed(2)} px to ${after.toFixed(2)} px from the reference's`);
    console.log(`offset x ${offset[0].toFixed(3)}, y ${offset[1].toFixed(3)}, z ${offset[2].toFixed(3)} metres`);
  },
});
