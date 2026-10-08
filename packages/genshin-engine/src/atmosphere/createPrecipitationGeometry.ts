import { Float32BufferAttribute, InstancedBufferGeometry } from "three";

// One unit streak drawn once per particle: its base at the bottom of the quad and its tip at the top, the material
// Derives each particle from its instance's index and so the instances carry no data of their own
export const createPrecipitationGeometry = (particleCount: number): InstancedBufferGeometry => {
  const precipitationGeometry = new InstancedBufferGeometry();
  precipitationGeometry.setAttribute(
    "position",
    new Float32BufferAttribute([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0], 3),
  );
  precipitationGeometry.setIndex([0, 1, 2, 0, 2, 3]);
  precipitationGeometry.instanceCount = particleCount;
  return precipitationGeometry;
};
