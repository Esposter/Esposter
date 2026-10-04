import type { SubCommandsDef } from "citty";

import { measureGlide } from "#src/services/genshinParity/witness/measureGlide";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

const toPair = (value: string, name: string): [number, number] => {
  const [first = 0, second = 0] = parseNumbers(value, name, 2);
  return [first, second];
};

export const glideCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description: "The id of a recording's frame in ParityReferenceMap, whose capture is read",
      required: true,
      type: "positional",
    },
    time: { description: "The second of the capture to start at", required: true, type: "positional" },
    seconds: { description: "How long to read for", required: true, type: "positional" },
    band: { default: "6.3,9.5", description: "The ground's distances ahead read, near,far in metres", type: "string" },
    column: {
      default: "940,40",
      description: "The capture's columns down the ground straight ahead, left,width in its pixels",
      type: "string",
    },
    "eye-height": { description: "The camera's eye over the ground, in metres", required: true, type: "string" },
    fov: { description: "The camera's vertical field of view, in degrees", required: true, type: "string" },
    fps: { default: "60", description: "Frames read a second", type: "string" },
    pitch: { description: "The camera's pitch up, in degrees", required: true, type: "string" },
    window: { default: "0.5", description: "Seconds each pace is summed over", type: "string" },
  },
  meta: {
    description:
      "Read the pace of a world gliding toward a still camera off a recording: the ground straight ahead at the camera's pose, each frame's shift from the one before, in metres a second over each window, with its held frames",
    name: "glide",
  },
  run: async ({ args }) => {
    const windows = await measureGlide(args.reference, {
      band: toPair(args.band, "band"),
      column: toPair(args.column, "column"),
      durationSeconds: Number(args.seconds),
      eyeHeight: Number(args["eye-height"]),
      fov: Number(args.fov),
      framesPerSecond: Number(args.fps),
      pitch: Number(args.pitch),
      startSeconds: Number(args.time),
      windowSeconds: Number(args.window),
    });
    for (const { heldCount, seconds, speed } of windows)
      console.log(`${seconds.toFixed(2)} s: ${speed.toFixed(2)} m/s, ${heldCount} frames held`);
  },
});
