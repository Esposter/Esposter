import type { LightningBolt } from "#src/models/atmosphere/LightningBolt";

import { BufferAttribute, BufferGeometry } from "three";

// A bolt's arrays wrapped for the GPU, its bounds taken so the bolt is culled as any mesh is
export const createLightningBoltGeometry = ({
  directions,
  indices,
  positions,
  sides,
}: LightningBolt): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("boltDirection", new BufferAttribute(directions, 3));
  geometry.setAttribute("boltSide", new BufferAttribute(sides, 1));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
};
