import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { PLACE_AXES } from "#src/services/genshinParity/witness/constants";
import { placeFamilies } from "#src/services/genshinParity/witness/placeFamilies";
import { placeFamiliesOnLandmarks } from "#src/services/genshinParity/witness/placeFamiliesOnLandmarks";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

const AXES: readonly string[] = ["x", "y", "z"];
// A period's range parsed whole, an unknown axis or a step that never advances the phase rejected rather than read
// As z or left to hang the scan
const toScan = (scan: string): { axis: 0 | 1 | 2; from: number; step: number; to: number } => {
  const [axis = "", ...range] = scan.split(":");
  const axisIndex = AXES.indexOf(axis);
  if (axisIndex === -1)
    throw new InvalidOperationError(Operation.Read, "scan", `${axis} is not one of ${AXES.join(",")}`);
  const [from = 0, to = 0, step = 0] = parseNumbers(range.join(","), "scan", 3);
  if (step <= 0) throw new InvalidOperationError(Operation.Read, "scan", `${step} is not a positive step`);
  return { axis: axisIndex as 0 | 1 | 2, from, step, to };
};
// An unknown axis rejected rather than left as a free dimension the placement never reads
const toAxes = (axes: string): (typeof PLACE_AXES)[number][] =>
  axes.split(",").map((axis) => {
    const placeAxis = PLACE_AXES.find((knownAxis) => knownAxis === axis);
    if (!placeAxis)
      throw new InvalidOperationError(Operation.Read, "axes", `${axis} is not one of ${PLACE_AXES.join(",")}`);
    return placeAxis;
  });
const toPoint = (point: string): [number, number, number] => {
  const [x = 0, y = 0, z = 0] = parseNumbers(point, "start", 3);
  return [x, y, z];
};
export const placeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    families: { description: "The families moved as one, comma-separated", type: "string" },
    axes: {
      default: PLACE_AXES.join(","),
      description: `The axes a landmark placement moves, comma-separated, of ${PLACE_AXES.join(", ")}`,
      type: "string",
    },
    landmarks: {
      description:
        "Landmarks on the row instead of its edges, comma-separated, fitted through --pose with a turn as well",
      type: "string",
    },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
    iterations: { default: "60", description: "The simplex's steps", type: "string" },
    scan: {
      description:
        "A period to read at every step first, as axis:from:to:step (z:0:200:1 for the towers' row), from the start",
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
    if (args.landmarks) {
      if (!args.pose) throw new InvalidOperationError(Operation.Read, "pose", "a landmark placement needs the camera");
      const { errors, laidOutErrors, offset, rms, turn } = await placeFamiliesOnLandmarks(
        args.reference,
        args.witness,
        {
          axes: toAxes(args.axes),
          landmarkNames: args.landmarks.split(","),
          pose: parseNumbers(args.pose, "pose", CAMERA_POSE_AXES.length),
        },
      );
      for (const [name, error] of Object.entries(errors))
        console.log(`${name}: ${(laidOutErrors[name] ?? 0).toFixed(2)} px laid out, ${error.toFixed(2)} px placed`);
      console.log(`reprojection ${rms.toFixed(2)} px root mean square`);
      console.log(
        `offset x ${offset[0].toFixed(3)}, y ${offset[1].toFixed(3)}, z ${offset[2].toFixed(3)} metres, turn ${turn.toFixed(3)} degrees`,
      );
      return;
    }
    if (!args.families) throw new InvalidOperationError(Operation.Read, "families", "none given to place on edges");
    const { after, before, offset } = await placeFamilies(args.reference, args.witness, {
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
