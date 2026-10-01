import { BoxGeometry, BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A shape as the boxes it is built of, each [minX, minY, minZ, maxX, maxY, maxZ], merged into one geometry: a fitted
// Hull, solid where its boxes are and open between them
export const createBoxesGeometry = (boxes: readonly (readonly number[])[]): BufferGeometry => {
  const parts = boxes.map(([minX = 0, minY = 0, minZ = 0, maxX = 0, maxY = 0, maxZ = 0]) =>
    new BoxGeometry(maxX - minX, maxY - minY, maxZ - minZ).translate(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    ),
  );
  const geometry = mergeGeometries(parts) ?? new BufferGeometry();
  for (const part of parts) part.dispose();
  return geometry;
};
