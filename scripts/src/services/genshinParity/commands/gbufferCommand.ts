import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { readReferenceGbuffer } from "#src/services/genshinParity/readReferenceGbuffer";
import { toPageCamera } from "#src/services/genshinParity/toPageCamera";
import { writeWitnessGbuffer } from "#src/services/genshinParity/writeWitnessGbuffer";
import { defineCommand } from "citty";

export const gbufferCommand: SubCommandsDef[string] = defineCommand({
  args: {
    pose: {
      description: `A pose in place of the reference's, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      type: "string",
    },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: { description: "The component whose exports the witness draws", required: true, type: "string" },
  },
  meta: {
    description:
      "Render a reference's witness G-buffer in one settled frame, its clock held: depth, world normal, unlit albedo and part per pixel, written as raw floats with a header and a preview",
    name: "gbuffer",
  },
  run: async ({ args }) => {
    const { gbuffer, shot } = await readReferenceGbuffer(
      args.reference,
      parseDerivedAssetComponent(args.witness),
      args.pose ? toPageCamera(args.pose.split(",").map(Number)) : undefined,
    );
    const drawn = gbuffer.part.filter((_, index) => index % 4 === 0 && gbuffer.part[index] !== 0).length;
    console.log(
      `${gbuffer.width}×${gbuffer.height}, ${gbuffer.parts.length} parts, ${((drawn / (gbuffer.width * gbuffer.height)) * 100).toFixed(1)}% of pixels drawn`,
    );
    console.log(`shot | part | normal | depth | albedo: ${await writeWitnessGbuffer(args.reference, gbuffer, shot)}`);
  },
});
