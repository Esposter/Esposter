import type { SubCommandsDef } from "citty";

import { poseArg } from "#src/services/genshinParity/commands/poseArg";
import { witnessArg } from "#src/services/genshinParity/commands/witnessArg";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/shared/constants";
import { readReferenceGbuffer } from "#src/services/genshinParity/shared/readReferenceGbuffer";
import { toPageCamera } from "#src/services/genshinParity/shared/toPageCamera";
import { writeWitnessGbuffer } from "#src/services/genshinParity/witness/writeWitnessGbuffer";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { defineCommand } from "citty";

export const gbufferCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pose: poseArg,
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: witnessArg,
  },
  meta: {
    description:
      "Render a reference's witness G-buffer in one settled frame, its clock held: depth, world normal, unlit albedo and part per pixel, written as raw floats with a header and a preview",
    name: "gbuffer",
  },
  run: async ({ args }) => {
    const { gbuffer, shot } = await readReferenceGbuffer(
      args.reference,
      args.witness,
      args.pose ? toPageCamera(parseNumbers(args.pose, "pose", CAMERA_POSE_AXES.length)) : undefined,
    );
    const drawn = gbuffer.part.filter((_value, index) => index % 4 === 0 && gbuffer.part[index] !== 0).length;
    console.log(
      `${gbuffer.width}×${gbuffer.height}, ${gbuffer.parts.length} parts, ${((drawn / (gbuffer.width * gbuffer.height)) * 100).toFixed(1)}% of pixels drawn`,
    );
    console.log(`shot | part | normal | depth | albedo: ${await writeWitnessGbuffer(args.reference, gbuffer, shot)}`);
  },
});
