import type { BufferGeometry } from "three";

import { createLatheStackGeometry } from "genshin-engine";
import { LatheGeometry, Vector2 } from "three";

const TORCH_RADIAL_SEGMENTS = 8;
const FLAME_SEGMENTS = 12;
// The torch's height to its brazier's rim, where the flame stands, in metres
const TORCH_HEIGHT = 2.15;
// The flame's silhouette from its base up, in metres from the axis and above the brazier's rim
const FLAME_PROFILE = [
  new Vector2(0, 0),
  new Vector2(0.22, 0.05),
  new Vector2(0.3, 0.4),
  new Vector2(0.18, 0.85),
  new Vector2(0, 1.1),
];
// A Kresnik's Torch as its stone and its flame, two geometries for two materials: a stepped plinth, a tapering shaft
// And a cup brazier, and the flame standing in the cup
export const createKresnikTorchGeometry = (): { flameGeometry: BufferGeometry; stoneGeometry: BufferGeometry } => {
  const stoneGeometry = createLatheStackGeometry({
    isFaceted: true,
    radialSegments: TORCH_RADIAL_SEGMENTS,
    sections: [
      { bottomRadius: 0.55, height: 0.3, topRadius: 0.5 },
      { bottomRadius: 0.36, height: 1.6, topRadius: 0.26 },
      { bottomRadius: 0.2, height: 0.25, topRadius: 0.42 },
    ],
  });
  const flameGeometry = new LatheGeometry(FLAME_PROFILE, FLAME_SEGMENTS).translate(0, TORCH_HEIGHT, 0);
  return { flameGeometry, stoneGeometry };
};
