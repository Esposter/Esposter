import type { TowerSlab } from "#src/models/login/TowerSlab";

import { LOGIN_TOWER_COLUMN_EMBED, LOGIN_TOWER_RADIAL_SEGMENTS } from "#src/services/login/tower/constants";
import { BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute } from "three";

// A face is four corners of three coordinates, drawn as two triangles of six indices
const CORNER_COUNT = 4;
const COORDINATE_COUNT = 3;
const INDEX_COUNT = 6;
// The order a face's corners are written in, and the reverse a side takes when it faces into the opening it is sunk in
const FORWARD_ORDER = [0, 1, 2, 3];
const REVERSED_ORDER = [3, 2, 1, 0];

// Writes a corner, a point round the tower's axis at a turn from +z toward +x, as three's lathe turns: a radius out and a
// Height up
const writeCorner = (corners: Float64Array, corner: number, turn: number, radius: number, y: number): void => {
  const offset = corner * COORDINATE_COUNT;
  corners[offset] = radius * Math.sin(turn * 2 * Math.PI);
  corners[offset + 1] = y;
  corners[offset + 2] = radius * Math.cos(turn * 2 * Math.PI);
};
// A slab of a tower's wall as its buffers, over the turns its span covers round a tower of that breadth and up its height,
// Each face flat-shaded so its edges stand sharp as carved stone's do. One standing out, a rib or a pilaster, is a curved
// Prism from a little inside the wall out to its depth, its inside within the wall and never drawn; one sunk in, a window
// Or a bay, is the box behind the lathe's opening, its back turned out and its sides turned into it. Each face is four
// Corners of its own and two triangles, indexed as the lathe it is merged with is
export const computeLoginTowerSlabGeometry = (
  [radius = 0, depth = 0, roundFrom = 0, roundTo = 0, bottom = 0, top = 0]: TowerSlab,
  breadth: number,
  { isSunk = false }: { isSunk?: boolean } = {},
) => {
  // The fit rounds a span to its facade's cells, so one ending at the seam can run on past a whole turn: it stops at the
  // Seam, where its last corners stand a hair short of it as the lathe's do and read its tile's far edge
  const [startTurn, endTurn] = [roundFrom / breadth, Math.min(roundTo / breadth, 1)];
  const segmentCount = Math.max(1, Math.ceil((endTurn - startTurn) * LOGIN_TOWER_RADIAL_SEGMENTS));
  const getTurn = (index: number) => startTurn + ((endTurn - startTurn) * index) / segmentCount;
  // A slab standing out runs from inside the wall to its face; one sunk in from its back to the wall, where the lathe is
  // Cut open over it
  const [innerRadius, outerRadius] = isSunk
    ? [radius - depth, radius]
    : [radius - LOGIN_TOWER_COLUMN_EMBED, radius + depth];
  const faceRadius = isSunk ? innerRadius : outerRadius;
  const sideOrder = isSunk ? REVERSED_ORDER : FORWARD_ORDER;
  // A segment is a face and two sides, and the slab is two ends more
  const faceCount = segmentCount * 3 + 2;
  const positions = new Float32Array(faceCount * CORNER_COUNT * COORDINATE_COUNT);
  const normals = new Float32Array(positions.length);
  const indices = new Uint32Array(faceCount * INDEX_COUNT);
  const corners = new Float64Array(CORNER_COUNT * COORDINATE_COUNT);
  let face = 0;
  // A face from the corners in the scratch buffer, counter-clockwise seen from outside, lit by the normal its first triangle faces
  const addFace = (order: number[]): void => {
    const first = face * CORNER_COUNT;
    const aOffset = order[0] * COORDINATE_COUNT;
    const bOffset = order[1] * COORDINATE_COUNT;
    const dOffset = order[3] * COORDINATE_COUNT;
    const [edgeX, edgeY, edgeZ] = [
      corners[bOffset] - corners[aOffset],
      corners[bOffset + 1] - corners[aOffset + 1],
      corners[bOffset + 2] - corners[aOffset + 2],
    ];
    const [otherX, otherY, otherZ] = [
      corners[dOffset] - corners[aOffset],
      corners[dOffset + 1] - corners[aOffset + 1],
      corners[dOffset + 2] - corners[aOffset + 2],
    ];
    const normalX = edgeY * otherZ - edgeZ * otherY;
    const normalY = edgeZ * otherX - edgeX * otherZ;
    const normalZ = edgeX * otherY - edgeY * otherX;
    const length = Math.hypot(normalX, normalY, normalZ) || 1;
    for (let corner = 0; corner < CORNER_COUNT; corner += 1) {
      const source = order[corner] * COORDINATE_COUNT;
      const target = (first + corner) * COORDINATE_COUNT;
      positions[target] = corners[source];
      positions[target + 1] = corners[source + 1];
      positions[target + 2] = corners[source + 2];
      normals[target] = normalX / length;
      normals[target + 1] = normalY / length;
      normals[target + 2] = normalZ / length;
    }
    const index = face * INDEX_COUNT;
    indices[index] = first;
    indices[index + 1] = first + 1;
    indices[index + 2] = first + 2;
    indices[index + 3] = first;
    indices[index + 4] = first + 2;
    indices[index + 5] = first + 3;
    face += 1;
  };
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const turn = getTurn(segment);
    const nextTurn = getTurn(segment + 1);
    // Its face, then its top and its foot between the wall and that face
    writeCorner(corners, 0, turn, faceRadius, bottom);
    writeCorner(corners, 1, nextTurn, faceRadius, bottom);
    writeCorner(corners, 2, nextTurn, faceRadius, top);
    writeCorner(corners, 3, turn, faceRadius, top);
    addFace(FORWARD_ORDER);
    writeCorner(corners, 0, turn, outerRadius, top);
    writeCorner(corners, 1, nextTurn, outerRadius, top);
    writeCorner(corners, 2, nextTurn, innerRadius, top);
    writeCorner(corners, 3, turn, innerRadius, top);
    addFace(sideOrder);
    writeCorner(corners, 0, turn, innerRadius, bottom);
    writeCorner(corners, 1, nextTurn, innerRadius, bottom);
    writeCorner(corners, 2, nextTurn, outerRadius, bottom);
    writeCorner(corners, 3, turn, outerRadius, bottom);
    addFace(sideOrder);
  }
  // Its two ends, facing back and on round the tower
  writeCorner(corners, 0, startTurn, innerRadius, bottom);
  writeCorner(corners, 1, startTurn, outerRadius, bottom);
  writeCorner(corners, 2, startTurn, outerRadius, top);
  writeCorner(corners, 3, startTurn, innerRadius, top);
  addFace(sideOrder);
  writeCorner(corners, 0, endTurn, outerRadius, bottom);
  writeCorner(corners, 1, endTurn, innerRadius, bottom);
  writeCorner(corners, 2, endTurn, innerRadius, top);
  writeCorner(corners, 3, endTurn, outerRadius, top);
  addFace(sideOrder);
  return { indices, normals, positions };
};
export const createLoginTowerSlabGeometry = (
  slab: TowerSlab,
  breadth: number,
  { isSunk = false }: { isSunk?: boolean } = {},
): BufferGeometry => {
  const { indices, normals, positions } = computeLoginTowerSlabGeometry(slab, breadth, { isSunk });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  // The lathe it is merged with carries texture coordinates, which the facade's own attribute stands in for
  geometry.setAttribute("uv", new Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  return geometry;
};
