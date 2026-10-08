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
    const { direction, distance, edgeCount, imagePath, solved } = await solveReferenceShadows(
      args.reference,
      args.witness,
      true,
    );
    if (edgeCount === 0) {
      console.log(`${args.reference} shows no shadow's edge on a flat receiver`);
      return;
    }
    console.log(
      `the scene's direction ${formatDirection(direction)}: its shadows' edges ${distance.toFixed(2)} px from the reference's ${edgeCount} edge pixels`,
    );
    if (solved) {
      const angle = MathUtils.radToDeg(new Vector3(...direction).angleTo(new Vector3(...solved.direction)));
      console.log(
        `solved ${formatDirection(solved.direction)}: ${solved.distance.toFixed(2)} px, ${angle.toFixed(1)} degrees from the scene's`,
      );
    }
    console.log(`the reference's edges green, the scene's red, the solved blue: ${imagePath}`);
  },
});
