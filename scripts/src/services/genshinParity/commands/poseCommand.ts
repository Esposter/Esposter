import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { CAMERA_POSE_AXES } from "#src/services/genshinParity/constants";
import { solveReferencePose } from "#src/services/genshinParity/solveReferencePose";
import { defineCommand } from "citty";

const axes: readonly string[] = CAMERA_POSE_AXES;

export const poseCommand: SubCommandsDef[string] = defineCommand({
  args: {
    families: { description: "The families whose edges refine the pose, comma separated", type: "string" },
    hold: {
      description: `Axes held at the start's values, comma separated, of ${CAMERA_POSE_AXES.join(", ")}: the field of view read from two widths`,
      type: "string",
    },
    landmarks: { description: "Only these of the reference's landmarks, comma separated", type: "string" },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    refine: {
      description: "Steps of the simplex on the families' edges after the solve (none unless told)",
      type: "string",
    },
    start: {
      description: `A pose to solve from, needed under six landmarks, as ${CAMERA_POSE_AXES.join(",")} (metres, then degrees)`,
      type: "string",
    },
    witness: {
      description: "The component whose landmarks and exports the witness draws",
      required: true,
      type: "string",
    },
  },
  meta: {
    description:
      "Solve a reference's camera pose from its landmarks: the pixels given snapped to corners, the pose in closed form, refined on the reprojection error and printed per landmark, then optionally on the edges of families",
    name: "pose",
  },
  run: async ({ args }) => {
    const { errors, imagePath, pose, refinement, rms } = await solveReferencePose(
      args.reference,
      parseDerivedAssetComponent(args.witness),
      {
        families: args.families?.split(","),
        heldAxes: args.hold?.split(",").map((axis) => axes.indexOf(axis)),
        landmarkNames: args.landmarks?.split(","),
        refineIterations: args.refine ? Number(args.refine) : 0,
        start: args.start?.split(",").map(Number),
      },
    );
    for (const [name, error] of Object.entries(errors)) console.log(`${name}: ${error.toFixed(2)} px`);
    console.log(`reprojection ${rms.toFixed(2)} px root mean square`);
    if (refinement)
      console.log(`edges ${refinement.before.toFixed(2)} px to ${refinement.after.toFixed(2)} px from the reference's`);
    console.log(`pose ${CAMERA_POSE_AXES.map((axis, index) => `${axis} ${(pose[index] ?? 0).toFixed(3)}`).join(", ")}`);
    console.log(`given | snapped | projected: ${imagePath}`);
  },
});
