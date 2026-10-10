import type { TreeTube } from "#src/models/kits/tree/TreeTube";
import type { TreeTubes } from "#src/models/kits/tree/TreeTubes";

// The fewest sides a tube's rings have, and the longest a side runs round its widest ring and a section along its
// Spline, in metres, so a trunk metres wide is as round as a root
const MIN_TUBE_SIDES = 6;
const TUBE_SIDE_LENGTH = 1;
const TUBE_SECTION_LENGTH = 0.5;
// Centripetal Catmull-Rom, which neither loops nor cusps where a tube's points are spaced unevenly
const CATMULL_ROM_ALPHA = 0.5;
// The least knot interval, so two points standing together divide by no zero
const MIN_KNOT_INTERVAL = 1e-6;
// How near the vertical a tube may start before its first normal is taken from across instead
const VERTICAL_COSINE = 0.9;
const AXES = ["x", "y", "z"] as const;
const FULL_TURN = Math.PI * 2;

// A tube's point's coordinate on one axis, its ends carried on past it as reflections so the spline runs through both
const readControl = (tube: TreeTube, index: number, axis: (typeof AXES)[number]): number => {
  const last = tube.length - 1;
  if (index < 0) return 2 * tube[0][axis] - tube[1][axis];
  if (index > last) return 2 * (tube[last]?.[axis] ?? 0) - (tube[last - 1]?.[axis] ?? 0);
  return tube[index]?.[axis] ?? 0;
};
const readControlDistance = (tube: TreeTube, first: number, second: number): number =>
  Math.hypot(...AXES.map((axis) => readControl(tube, second, axis) - readControl(tube, first, axis)));
// How many sections the span from a tube's point to the next is cut into
const countSpanSections = (tube: TreeTube, span: number): number =>
  Math.max(1, Math.ceil(readControlDistance(tube, span, span + 1) / TUBE_SECTION_LENGTH));
const countRings = (tube: TreeTube): number => {
  let ringCount = 1;
  for (let span = 0; span < tube.length - 1; span++) ringCount += countSpanSections(tube, span);
  return ringCount;
};
// How many sides a tube's rings have, so no side round its widest ring runs past the side length
const countSides = (tube: TreeTube): number =>
  Math.max(MIN_TUBE_SIDES, Math.ceil((FULL_TURN * Math.max(...tube.map(({ radius }) => radius))) / TUBE_SIDE_LENGTH));
// Writes the centre at a share of the way along one span of the spline, Barry and Goldman's pyramid over the span's four
// Points and their centripetal knots
const writeSpanCentre = (centres: Float32Array, ring: number, tube: TreeTube, span: number, share: number): void => {
  const knot1 = Math.max(readControlDistance(tube, span - 1, span) ** CATMULL_ROM_ALPHA, MIN_KNOT_INTERVAL);
  const knot2 = knot1 + Math.max(readControlDistance(tube, span, span + 1) ** CATMULL_ROM_ALPHA, MIN_KNOT_INTERVAL);
  const knot3 = knot2 + Math.max(readControlDistance(tube, span + 1, span + 2) ** CATMULL_ROM_ALPHA, MIN_KNOT_INTERVAL);
  const knot = knot1 + (knot2 - knot1) * share;
  for (const [axisIndex, axis] of AXES.entries()) {
    const point0 = readControl(tube, span - 1, axis);
    const point1 = readControl(tube, span, axis);
    const point2 = readControl(tube, span + 1, axis);
    const point3 = readControl(tube, span + 2, axis);
    const a1 = ((knot1 - knot) * point0 + knot * point1) / knot1;
    const a2 = ((knot2 - knot) * point1 + (knot - knot1) * point2) / (knot2 - knot1);
    const a3 = ((knot3 - knot) * point2 + (knot - knot2) * point3) / (knot3 - knot2);
    const b1 = ((knot2 - knot) * a1 + knot * a2) / knot2;
    const b2 = ((knot3 - knot) * a2 + (knot - knot1) * a3) / (knot3 - knot1);
    centres[ring * 3 + axisIndex] = ((knot2 - knot) * b1 + (knot - knot1) * b2) / (knot2 - knot1);
  }
};
// A tree's wood, its trunk, limbs and surface roots, each a tube swept along a centripetal Catmull-Rom spline through
// Its points, its radius running straight from point to point, so a tube tapers as its points do and closes where a
// Point's radius is none. Each ring of a tube is turned along the spline by parallel transport, so it never twists, its
// Sides as many as keep it round at its widest, and the tube is open at its start, which stands on the ground or inside
// The trunk, limb or root it grows from. A tube's texture coordinates run once round it and along it in metres
export const computeTreeTubes = (tubes: readonly TreeTube[]): TreeTubes => {
  const ringCounts = tubes.map((tube) => countRings(tube));
  const sideCounts = tubes.map((tube) => countSides(tube));
  let vertexCount = 0;
  let triangleCount = 0;
  for (const [tubeIndex, ringCount] of ringCounts.entries()) {
    const sideCount = sideCounts[tubeIndex] ?? MIN_TUBE_SIDES;
    vertexCount += ringCount * (sideCount + 1);
    triangleCount += (ringCount - 1) * sideCount * 2;
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint32Array(triangleCount * 3);
  const centres = new Float32Array(Math.max(0, ...ringCounts) * 3);
  const radii = new Float32Array(Math.max(0, ...ringCounts));
  let vertexStart = 0;
  let indexOffset = 0;
  for (const [tubeIndex, tube] of tubes.entries()) {
    const ringCount = ringCounts[tubeIndex] ?? 0;
    const sideCount = sideCounts[tubeIndex] ?? MIN_TUBE_SIDES;
    const ringVertexCount = sideCount + 1;
    let ring = 0;
    for (let span = 0; span < tube.length - 1; span++) {
      const sectionCount = countSpanSections(tube, span);
      const startRadius = tube[span]?.radius ?? 0;
      const endRadius = tube[span + 1]?.radius ?? 0;
      // A span's first ring is the last of the span before it, so only the first span writes its own
      for (let section = span === 0 ? 0 : 1; section <= sectionCount; section++, ring++) {
        const share = section / sectionCount;
        writeSpanCentre(centres, ring, tube, span, share);
        radii[ring] = startRadius + (endRadius - startRadius) * share;
      }
    }
    // The first normal is square to the first tangent, from the vertical unless the tube starts near it
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
      for (let side = 0; side <= sideCount; side++) {
        const turn = (side / sideCount) * FULL_TURN;
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
        uvs[vertex * 2] = side / sideCount;
        uvs[vertex * 2 + 1] = distanceAlong;
      }
      if (ringIndex === ringCount - 1) continue;
      // Each side of a section as two triangles wound outward
      for (let side = 0; side < sideCount; side++) {
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
