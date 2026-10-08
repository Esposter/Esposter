import type { Vector } from "#src/models/shared/Vector";
import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { solveReferenceShadows } from "#src/services/genshinParity/witness/solveReferenceShadows";
import { defineCommand } from "citty";
import { MathUtils, Vector3 } from "three";

const formatDirection = (direction: Readonly<Vector>): string =>
  `[${direction.map((value) => value.toFixed(3)).join(", ")}]`;

export const shadowsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Solve the sun's direction on a reference's shadows' edges over flat receivers: the exports' shadows cast from each direction tried against the edges the reference's shading shows, both ways in its pixels, printed beside the scene's own direction and drawn over the reference",
    name: "shadows",
  },
  run: async ({ args }) => {
    const { direction, distance, edgeCount, imagePath, ourEdgeCount, probes, solved } = await solveReferenceShadows(
      args.reference,
      args.witness,
      true,
    );
    if (edgeCount === 0) {
      console.log(`${args.reference} shows no shadow's edge on a flat receiver`);
      return;
    }
    console.log(
      `the scene's direction ${formatDirection(direction)}: its shadows' ${ourEdgeCount} edge pixels ${distance.toFixed(2)} px from the reference's ${edgeCount}`,
    );
    // The objective about the scene's direction: a cost no direction moves is a render that drew no direction's shadow
    for (const probe of probes)
      console.log(
        `  probed ${formatDirection(probe.direction)}: ${probe.ourEdgeCount} edge pixels, ${probe.distance.toFixed(2)} px`,
      );
    if (solved) {
      const angle = MathUtils.radToDeg(new Vector3(...direction).angleTo(new Vector3(...solved.direction)));
      console.log(
        `solved ${formatDirection(solved.direction)}: ${solved.ourEdgeCount} edge pixels, ${solved.distance.toFixed(2)} px, ${angle.toFixed(1)} degrees from the scene's`,
      );
    }
    console.log(`the reference's edges green, the scene's red, the solved blue: ${imagePath}`);
  },
});
