import type { WaterfallSheet } from "#src/models/water/WaterfallSheet";

import { BufferGeometry, Float32BufferAttribute } from "three";

// A waterfall's sheet as one quad hung from its lip, dropping straight down to the pool. Across it u runs from one edge
// To the other and v runs from the lip, 0, to the foot, 1, so its streaks fall with v
export const createWaterfallGeometry = ({ across, drop, lip, width }: WaterfallSheet): BufferGeometry => {
  const halfWidth = width / 2;
  const left = lip.clone().addScaledVector(across, -halfWidth);
  const right = lip.clone().addScaledVector(across, halfWidth);
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(
      [
        left.x,
        left.y,
        left.z,
        right.x,
        right.y,
        right.z,
        left.x,
        left.y - drop,
        left.z,
        right.x,
        right.y - drop,
        right.z,
      ],
      3,
    ),
  );
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
  geometry.setIndex([0, 2, 1, 1, 2, 3]);
  return geometry;
};
