import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { trackCamera } from "#src/services/genshinParity/trackCamera";
import { defineCommand } from "citty";

export const trackCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description: "The id of a recording's frame in ParityReferenceMap, whose capture is tracked",
      required: true,
      type: "positional",
    },
    time: { description: "The second of the capture to start at", required: true, type: "positional" },
    seconds: { description: "How long to track for", required: true, type: "positional" },
    families: {
      description: "The families whose edges each frame is refined on, comma separated",
      required: true,
      type: "string",
    },
    fps: { default: "4", description: "Frames sampled a second", type: "string" },
    iterations: { default: "30", description: "Steps of the simplex a frame", type: "string" },
    start: {
      description: `The pose at the first frame, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      required: true,
      type: "string",
    },
    witness: { description: "The component whose exports the witness draws", required: true, type: "string" },
  },
  meta: {
    description:
      "Track the camera across a reference's recording: each sampled frame's pose refined on the families' edges from the frame before's, written as position, heading, pitch and field of view over time",
    name: "track",
  },
  run: async ({ args }) => {
    const { path, track } = await trackCamera(args.reference, parseDerivedAssetComponent(args.witness), {
      durationSeconds: Number(args.seconds),
      families: args.families.split(","),
      framesPerSecond: Number(args.fps),
      iterationCount: Number(args.iterations),
      start: args.start.split(",").map(Number),
      startSeconds: Number(args.time),
    });
    for (const { distance, pose, seconds } of track)
      console.log(
        `${seconds.toFixed(2)} s: ${pose.map((value) => value.toFixed(2)).join(", ")}, edges ${distance.toFixed(2)} px`,
      );
    console.log(path);
  },
});
