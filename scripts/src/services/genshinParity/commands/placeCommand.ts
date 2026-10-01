import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { placeFamilies } from "#src/services/genshinParity/placeFamilies";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

const AXES = ["x", "y", "z"] as const;
const toScan = (scan: string): { axis: 0 | 1 | 2; length: number; step: number } => {
  const [axis = "z", length = "0", step = "1"] = scan.split(":");
  const axisIndex = AXES.indexOf(axis as (typeof AXES)[number]);
  return { axis: axisIndex === -1 ? 2 : (axisIndex as 0 | 1 | 2), length: Number(length), step: Number(step) };
};
const toPoint = (point: string): [number, number, number] => {
  const [x = 0, y = 0, z = 0] = point.split(",").map(Number);
  return [x, y, z];
};
export const placeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    families: { description: "The families moved as one, comma-separated", required: true, type: "string" },
    witness: { description: "The component whose exports the witness draws", required: true, type: "string" },
    iterations: { default: "60", description: "The simplex's steps", type: "string" },
    scan: {
      description: "A period to read at every step first, as axis:length:step (z:200:1, the towers' row)",
      type: "string",
    },
    start: { description: "The offset the refinement starts from, x,y,z in metres", type: "string" },
    step: {
      default: "0.5",
      description: "The simplex's first step, in metres, about as far as the families may stand off",
      type: "string",
    },
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
      camera: args.pose ? toPageCamera(parseNumbers(args.pose, "pose", CAMERA_POSE_AXES.length)) : undefined,
      families: args.families.split(","),
      iterationCount: Number(args.iterations),
      scan: args.scan ? toScan(args.scan) : undefined,
      start: args.start ? toPoint(args.start) : undefined,
      step: Number(args.step),
      topRow: Number(args["top-row"]),
    });
    console.log(`edges ${before.toFixed(2)} px to ${after.toFixed(2)} px from the reference's`);
    console.log(`offset x ${offset[0].toFixed(3)}, y ${offset[1].toFixed(3)}, z ${offset[2].toFixed(3)} metres`);
  },
});
