import type { ColonnadeOptions } from "#src/kits/architecture/ColonnadeOptions";

import { BufferGeometry, CylinderGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A ring of columns about an axis, as the open crown of a tower holds up its cap, standing on the origin
export const createColonnadeGeometry = ({
  columnCount,
  columnHeight,
  columnRadius,
  radialSegments,
  ringRadius,
}: ColonnadeOptions): BufferGeometry => {
  const columns = Array.from({ length: columnCount }, (_, index) => {
    const angle = (index / columnCount) * Math.PI * 2;
    return new CylinderGeometry(columnRadius, columnRadius, columnHeight, radialSegments).translate(
      Math.cos(angle) * ringRadius,
      columnHeight / 2,
      Math.sin(angle) * ringRadius,
    );
  });
  const colonnadeGeometry = mergeGeometries(columns) ?? new BufferGeometry();
  for (const column of columns) column.dispose();
  return colonnadeGeometry;
};
