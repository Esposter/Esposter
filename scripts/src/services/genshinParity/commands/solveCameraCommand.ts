import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES, solveWitnessCamera } from "#src/services/genshinParity/solveWitnessCamera";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

const axes: readonly string[] = CAMERA_POSE_AXES;
// A range as `axis:from:to:step`, every value from its start to its end by its step; a step that is not positive would
// Never reach its end
const parseRange = (range: string): [string, number[]] => {
  const [axis = "", ...bounds] = range.split(":");
  const [from = 0, to = 0, step = 1] = bounds.map(Number);
  if (!axes.includes(axis) || ![from, to, step].every((bound) => Number.isFinite(bound)) || step <= 0 || to < from)
    throw new InvalidOperationError(
      Operation.Read,
      range,
      `not axis:from:to:step with an axis of ${CAMERA_POSE_AXES.join(", ")}, from at most to and a positive step`,
    );
  const values: number[] = [];
  for (let value = from; value <= to + step / 2; value += step) values.push(value);
  return [axis, values];
};

export const solveCameraCommand: SubCommandsDef[string] = defineCommand({
  args: {
    iterations: {
      default: "120",
      description: "The simplex's iterations from each of the grid's best poses",
      type: "string",
    },
    ranges: {
      description: `Axes to search on a grid, each axis:from:to:step, comma separated; axes ${CAMERA_POSE_AXES.join(", ")}`,
      type: "string",
    },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    start: {
      description: `The pose to start from, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      required: true,
      type: "string",
    },
    witness: { description: "The component whose exports the scene draws", required: true, type: "string" },
  },
  meta: {
    description: "Find the camera pose from which a witness render's edges sit nearest a reference's",
    name: "solve-camera",
  },
  run: async ({ args }) => {
    const ranges = Object.fromEntries((args.ranges ? args.ranges.split(",") : []).map((range) => parseRange(range)));
    const { distance, pose } = await solveWitnessCamera(
      args.reference,
      parseDerivedAssetComponent(args.witness),
      args.start.split(",").map(Number),
      ranges,
      Number(args.iterations),
    );
    console.log(
      `edge distance ${distance.toFixed(2)} px at ${CAMERA_POSE_AXES.map((axis, index) => `${axis} ${pose[index]?.toFixed(2)}`).join(", ")}`,
    );
  },
});
