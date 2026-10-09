import type { RootTubes } from "#src/models/kits/tree/RootTubes";
import type { TreeRoot } from "#src/models/kits/tree/TreeRoot";

// The sides of a root's tube, and the longest its sections run along its spline, in metres
const ROOT_RADIAL_SEGMENTS = 6;
const ROOT_SECTION_LENGTH = 0.5;
// Centripetal Catmull-Rom, which neither loops nor cusps where a root's points are spaced unevenly
const CATMULL_ROM_ALPHA = 0.5;
// The least knot interval, so two points standing together divide by no zero
const MIN_KNOT_INTERVAL = 1e-6;
// How near the vertical a root may start before its first normal is taken from across instead
const VERTICAL_COSINE = 0.9;
const AXES = ["x", "y", "z"] as const;
const FULL_TURN = Math.PI * 2;

// A root's point's coordinate on one axis, its ends carried on past it as reflections so the spline runs through both
const readControl = (root: TreeRoot, index: number, axis: (typeof AXES)[number]): number => {
  const last = root.length - 1;
  if (index < 0) return 2 * root[0][axis] - root[1][axis];
  if (index > last) return 2 * (root[last]?.[axis] ?? 0) - (root[last - 1]?.[axis] ?? 0);
  return root[index]?.[axis] ?? 0;
};
const readControlDistance = (root: TreeRoot, first: number, second: number): number =>
  Math.hypot(...AXES.map((axis) => readControl(root, second, axis) - readControl(root, first, axis)));
// How many sections the span from a root's point to the next is cut into
const countSpanSections = (root: TreeRoot, span: number): number =>
  Math.max(1, Math.ceil(readControlDistance(root, span, span + 1) / ROOT_SECTION_LENGTH));
const countRings = (root: TreeRoot): number => {
  let ringCount = 1;
  for (let span = 0; span < root.length - 1; span++) ringCount += countSpanSections(root, span);
  return ringCount;
};
// Writes the centre at a share of the way along one span of the spline, Barry and Goldman's pyramid over the span's four
// Points and their centripetal knots
const writeSpanCentre = (centres: Float32Array, ring: number, root: TreeRoot, span: number, share: number): void => {
  const knot1 = Math.max(readControlDistance(root, span - 1, span) ** CATMULL_ROM_ALPHA, MIN_KNOT_INTERVAL);
  const knot2 = knot1 + Math.max(readControlDistance(root, span, span + 1) ** CATMULL_ROM_ALPHA, MIN_KNOT_INTERVAL);
  const knot3 = knot2 + Math.max(readControlDistance(root, span + 1, span + 2) ** CATMULL_ROM_ALPHA, MIN_KNOT_INTERVAL);
  const knot = knot1 + (knot2 - knot1) * share;
  for (const [axisIndex, axis] of AXES.entries()) {
    const point0 = readControl(root, span - 1, axis);
    const point1 = readControl(root, span, axis);
    const point2 = readControl(root, span + 1, axis);
    const point3 = readControl(root, span + 2, axis);
    const a1 = ((knot1 - knot) * point0 + knot * point1) / knot1;
    const a2 = ((knot2 - knot) * point1 + (knot - knot1) * point2) / (knot2 - knot1);
    const a3 = ((knot3 - knot) * point2 + (knot - knot2) * point3) / (knot3 - knot2);
    const b1 = ((knot2 - knot) * a1 + knot * a2) / knot2;
    const b2 = ((knot3 - knot) * a2 + (knot - knot1) * a3) / (knot3 - knot1);
    centres[ring * 3 + axisIndex] = ((knot2 - knot) * b1 + (knot - knot1) * b2) / (knot2 - knot1);
  }
};
// A tree's surface roots, each a tube swept along a centripetal Catmull-Rom spline through its points, its radius
// Running straight from point to point, so a root tapers as its points do and closes where a point's radius is none.
// Each ring of the tube is turned along the spline by parallel transport, so it never twists, and the tube is open at
// Its start, which stands inside the trunk or the root it forks from. A root's texture coordinates run once round it
// And along it in metres
export const computeRootTubes = (roots: readonly TreeRoot[]): RootTubes => {
  const ringCounts = roots.map((root) => countRings(root));
  const ringTotal = ringCounts.reduce((sum, ringCount) => sum + ringCount, 0);
  const ringVertexCount = ROOT_RADIAL_SEGMENTS + 1;
  const vertexCount = ringTotal * ringVertexCount;
  const triangleCount = (ringTotal - roots.length) * ROOT_RADIAL_SEGMENTS * 2;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint32Array(triangleCount * 3);
  const centres = new Float32Array(Math.max(0, ...ringCounts) * 3);
  const radii = new Float32Array(Math.max(0, ...ringCounts));
  let vertexStart = 0;
  let indexOffset = 0;
  for (const [rootIndex, root] of roots.entries()) {
    const ringCount = ringCounts[rootIndex] ?? 0;
    let ring = 0;
    for (let span = 0; span < root.length - 1; span++) {
      const sectionCount = countSpanSections(root, span);
      const startRadius = root[span]?.radius ?? 0;
      const endRadius = root[span + 1]?.radius ?? 0;
      // A span's first ring is the last of the span before it, so only the first span writes its own
      for (let section = span === 0 ? 0 : 1; section <= sectionCount; section++, ring++) {
        const share = section / sectionCount;
        writeSpanCentre(centres, ring, root, span, share);
        radii[ring] = startRadius + (endRadius - startRadius) * share;
      }
    }
    // The first normal is square to the first tangent, from the vertical unless the root starts near it
    let normalX = 0;
    let normalY = 1;
    let normalZ = 0;
    let distanceAlong = 0;
    for (let ringIndex = 0; ringIndex < ringCount; ringIndex++) {
      const previous = Math.max(ringIndex - 1, 0);
      const next = Math.min(ringIndex + 1, ringCount - 1);
      const tangentX = (centres[next * 3] ?? 0) - (centres[previous * 3] ?? 0);
      const tangentY = (centres[next * 3 + 1] ?? 0) - (centres[previous * 3 + 1] ?? 0);
      const tangentZ = (centres[next * 3 + 2] ?? 0) - (centres[previous * 3 + 2] ?? 0);
      const tangentLength = Math.hypot(tangentX, tangentY, tangentZ) || 1;
      const unitX = tangentX / tangentLength;
      const unitY = tangentY / tangentLength;
      const unitZ = tangentZ / tangentLength;
      if (ringIndex === 0 && Math.abs(unitY) > VERTICAL_COSINE) {
        normalX = 1;
        normalY = 0;
      }
      // Parallel transport: the last ring's normal with its part along this tangent taken out
      const normalAlong = normalX * unitX + normalY * unitY + normalZ * unitZ;
      normalX -= normalAlong * unitX;
      normalY -= normalAlong * unitY;
      normalZ -= normalAlong * unitZ;
      const normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
      normalX /= normalLength;
      normalY /= normalLength;
      normalZ /= normalLength;
      const binormalX = unitY * normalZ - unitZ * normalY;
      const binormalY = unitZ * normalX - unitX * normalZ;
      const binormalZ = unitX * normalY - unitY * normalX;
      const centreX = centres[ringIndex * 3] ?? 0;
      const centreY = centres[ringIndex * 3 + 1] ?? 0;
      const centreZ = centres[ringIndex * 3 + 2] ?? 0;
      if (ringIndex > 0)
        distanceAlong += Math.hypot(
          centreX - (centres[previous * 3] ?? 0),
          centreY - (centres[previous * 3 + 1] ?? 0),
          centreZ - (centres[previous * 3 + 2] ?? 0),
        );
      const radius = radii[ringIndex] ?? 0;
      for (let side = 0; side <= ROOT_RADIAL_SEGMENTS; side++) {
        const turn = (side / ROOT_RADIAL_SEGMENTS) * FULL_TURN;
        const cosine = Math.cos(turn);
        const sine = Math.sin(turn);
        const directionX = cosine * normalX + sine * binormalX;
        const directionY = cosine * normalY + sine * binormalY;
        const directionZ = cosine * normalZ + sine * binormalZ;
        const vertex = vertexStart + ringIndex * ringVertexCount + side;
        positions[vertex * 3] = centreX + radius * directionX;
        positions[vertex * 3 + 1] = centreY + radius * directionY;
        positions[vertex * 3 + 2] = centreZ + radius * directionZ;
        normals[vertex * 3] = directionX;
        normals[vertex * 3 + 1] = directionY;
        normals[vertex * 3 + 2] = directionZ;
        uvs[vertex * 2] = side / ROOT_RADIAL_SEGMENTS;
        uvs[vertex * 2 + 1] = distanceAlong;
      }
      if (ringIndex === ringCount - 1) continue;
      // Each side of a section as two triangles wound outward
      for (let side = 0; side < ROOT_RADIAL_SEGMENTS; side++) {
        const lower = vertexStart + ringIndex * ringVertexCount + side;
        const upper = lower + ringVertexCount;
        indices[indexOffset] = lower;
        indices[indexOffset + 1] = lower + 1;
        indices[indexOffset + 2] = upper;
        indices[indexOffset + 3] = lower + 1;
        indices[indexOffset + 4] = upper + 1;
        indices[indexOffset + 5] = upper;
        indexOffset += 6;
      }
    }
    vertexStart += ringCount * ringVertexCount;
  }
  return { indices, normals, positions, uvs };
};
