import { BufferGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A kit's parts merged into one geometry for one material and one draw, the parts freed once they are merged; no
// Parts make an empty geometry
export const mergeGeometryParts = (parts: BufferGeometry[]): BufferGeometry => {
  const geometry = mergeGeometries(parts) ?? new BufferGeometry();
  for (const part of parts) part.dispose();
  return geometry;
};
