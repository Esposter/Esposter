import type { SubCommandsDef } from "citty";

import { poseArg } from "#src/services/genshinParity/commands/poseArg";
import { witnessArg } from "#src/services/genshinParity/commands/witnessArg";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { labelWitnessParts } from "#src/services/genshinParity/witness/labelWitnessParts";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

export const partsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    family: { description: "The family whose parts to number", required: true, type: "string" },
    witness: witnessArg,
    pose: poseArg,
  },
  meta: {
    description:
      "Number each part of a family where it lands on a reference, over the reference and the witness's render, for landmarks",
    name: "parts",
  },
  run: async ({ args }) => {
    const { imagePath, parts } = await labelWitnessParts(
      args.reference,
      args.witness,
      args.family,
      args.pose ? toPageCamera(parseNumbers(args.pose, "pose", CAMERA_POSE_AXES.length)) : undefined,
    );
    for (const [index, { mesh, pixel, position }] of parts.entries())
      console.log(
        `${index} ${mesh} at ${position.map((value) => value.toFixed(1)).join(",")}: pixel ${pixel.map((value) => Math.round(value)).join(",")}`,
      );
    console.log(imagePath);
  },
});
