import { computeGrassBlade } from "#src/vegetation/computeGrassBlade";
import { BufferAttribute, InstancedBufferGeometry } from "three";

// One blade's shape drawn once per cell of a ring: the instances carry no data of their own, since the material
// Derives each blade from its instance's index
export const createGrassGeometry = (segmentCount: number, bladeCount: number): InstancedBufferGeometry => {
  const { indices, positions } = computeGrassBlade(segmentCount);
  const grassGeometry = new InstancedBufferGeometry();
  grassGeometry.setAttribute("position", new BufferAttribute(positions, 3));
  // Up at every vertex, as the material shades a blade; the passes that read the geometry's own normal (the depth and
  // Outline passes) find one rather than warning of it missing
  grassGeometry.setAttribute(
    "normal",
    new BufferAttribute(
      Float32Array.from({ length: positions.length }, (_, index) => (index % 3 === 1 ? 1 : 0)),
      3,
    ),
  );
  grassGeometry.setIndex(new BufferAttribute(indices, 1));
  grassGeometry.instanceCount = bladeCount;
  return grassGeometry;
};
