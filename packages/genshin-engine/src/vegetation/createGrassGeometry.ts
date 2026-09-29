import { computeGrassBlade } from "#src/vegetation/computeGrassBlade";
import { BufferAttribute, InstancedBufferGeometry } from "three";

// One blade's shape drawn once per cell of a ring: the instances carry no data of their own, since the material
// Derives each blade from its instance's index
export const createGrassGeometry = (segmentCount: number, bladeCount: number): InstancedBufferGeometry => {
  const { indices, positions } = computeGrassBlade(segmentCount);
  const grassGeometry = new InstancedBufferGeometry();
  grassGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  grassGeometry.setIndex(new BufferAttribute(indices, 1));
  grassGeometry.instanceCount = bladeCount;
  return grassGeometry;
};
