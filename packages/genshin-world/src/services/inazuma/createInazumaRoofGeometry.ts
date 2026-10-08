import { InazumaBuildingRoof } from "#src/models/inazuma/InazumaBuildingRoof";
import { BufferGeometry, Triangle, Vector3 } from "three";

// A roof as the convex solid its planes close, its base included, so a camera under the eaves sees a ceiling rather than
// Through the tiles. The ridge runs along the longer side, and every face is wound to face out of the solid, flat-shaded
export const createInazumaRoofGeometry = (
  roof: InazumaBuildingRoof,
  width: number,
  depth: number,
  height: number,
): BufferGeometry => {
  const isRidgeAlongZ = depth > width;
  const halfLength = Math.max(width, depth) / 2;
  const halfBreadth = Math.min(width, depth) / 2;
  const isHipped = roof === InazumaBuildingRoof.Hipped;
  const ridgeHalfLength = isHipped ? halfLength - halfBreadth : halfLength;
  const point = (along: number, y: number, across: number): Vector3 =>
    isRidgeAlongZ ? new Vector3(across, y, along) : new Vector3(along, y, across);
  const a = point(-halfLength, 0, -halfBreadth);
  const b = point(halfLength, 0, -halfBreadth);
  const c = point(halfLength, 0, halfBreadth);
  const d = point(-halfLength, 0, halfBreadth);
  const ridgeStart = point(-ridgeHalfLength, height, 0);
  const ridgeEnd = point(ridgeHalfLength, height, 0);
  const faces = [
    [a, b, c],
    [a, c, d],
    [a, b, ridgeEnd],
    [a, ridgeEnd, ridgeStart],
    [d, c, ridgeEnd],
    [d, ridgeEnd, ridgeStart],
    isHipped ? [a, d, ridgeStart] : [b, c, ridgeEnd],
    isHipped ? [b, ridgeEnd, c] : [a, d, ridgeStart],
  ];
  const interior = point(0, height / 4, 0);
  const normal = new Vector3();
  const outwardPoints = faces.flatMap(([p, q, r]) => {
    const triangle = new Triangle(p, q, r);
    const isInward = triangle.getNormal(normal).dot(triangle.getMidpoint(new Vector3()).sub(interior)) < 0;
    return isInward ? [p, r, q] : [p, q, r];
  });
  const roofGeometry = new BufferGeometry().setFromPoints(outwardPoints);
  roofGeometry.computeVertexNormals();
  return roofGeometry;
};
