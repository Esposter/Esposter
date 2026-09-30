import type { LatheStackOptions } from "#src/kits/architecture/LatheStackOptions";

import { BufferGeometry, CylinderGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A column, a tower or a cornice as stacked sections, each a closed frustum standing on the one below, so where two
// Radii differ the step between them is a ledge with a hard edge, as a moulding is. Merged into one geometry for one
// Material, standing on the origin
export const createLatheStackGeometry = ({
  isFaceted,
  radialSegments,
  sections,
}: LatheStackOptions): BufferGeometry => {
  let footHeight = 0;
  const parts = sections.map(({ bottomRadius, height, topRadius }) => {
    const part = new CylinderGeometry(topRadius, bottomRadius, height, radialSegments).translate(
      0,
      footHeight + height / 2,
      0,
    );
    footHeight += height;
    return isFaceted ? part.toNonIndexed() : part;
  });
  const stackGeometry = mergeGeometries(parts) ?? new BufferGeometry();
  for (const part of parts) part.dispose();
  if (isFaceted) stackGeometry.computeVertexNormals();
  return stackGeometry;
};
