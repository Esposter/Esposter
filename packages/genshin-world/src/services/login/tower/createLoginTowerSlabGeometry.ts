import type { TowerSlab } from "#src/models/login/TowerSlab";

import { LOGIN_TOWER_COLUMN_EMBED, LOGIN_TOWER_RADIAL_SEGMENTS } from "#src/services/login/tower/constants";
import { BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute, Vector3 } from "three";

// A face is four corners of three coordinates, drawn as two triangles of six indices
const CORNER_COUNT = 4;
const COORDINATE_COUNT = 3;
const INDEX_COUNT = 6;

// Makes a corner, a point round the tower's axis at a turn from +z toward +x, as three's lathe turns: a radius out and
// A Height up
const writeCorner = (turn: number, radius: number, y: number) =>
  new Vector3(radius * Math.sin(turn * 2 * Math.PI), y, radius * Math.cos(turn * 2 * Math.PI));
// A slab of a tower's wall as its buffers, over the turns its span covers round a tower of that breadth and up its
// Height, Each face flat-shaded so its edges stand sharp as carved stone's do. One standing out, a rib or a pilaster,
// Is a curved Prism from a little inside the wall out to its depth, its inside within the wall and never drawn; one
// Sunk in, a window Or a bay, is the box behind the lathe's opening, its back turned out and its sides turned into it.
// Each face is four Corners of its own and two triangles, indexed as the lathe it is merged with is
export const computeLoginTowerSlabGeometry = (
  [radius = 0, depth = 0, roundFrom = 0, roundTo = 0, bottom = 0, top = 0]: TowerSlab,
  breadth: number,
  { isSunk = false }: { isSunk?: boolean } = {},
) => {
  // The fit rounds a span to its facade's cells, so one ending at the seam can run on past a whole turn: it stops at
  // The Seam, where its last corners stand a hair short of it as the lathe's do and read its tile's far edge
  const [startTurn, endTurn] = [roundFrom / breadth, Math.min(roundTo / breadth, 1)];
  const segmentCount = Math.max(1, Math.ceil((endTurn - startTurn) * LOGIN_TOWER_RADIAL_SEGMENTS));
  const getTurn = (index: number) => startTurn + ((endTurn - startTurn) * index) / segmentCount;
  // A slab standing out runs from inside the wall to its face; one sunk in from its back to the wall, where the lathe
  // Is Cut open over it
  const [innerRadius, outerRadius] = isSunk
    ? [radius - depth, radius]
    : [radius - LOGIN_TOWER_COLUMN_EMBED, radius + depth];
  const faceRadius = isSunk ? innerRadius : outerRadius;
  // A segment is a face and two sides, and the slab is two ends more
  const faceCount = segmentCount * 3 + 2;
  const positions = new Float32Array(faceCount * CORNER_COUNT * COORDINATE_COUNT);
  const normals = new Float32Array(positions.length);
  const indices = new Uint32Array(faceCount * INDEX_COUNT);
  let face = 0;
  // A face of four corners in the order given, counter-clockwise seen from outside, lit by the normal its first
  // Triangle faces
  const addFace = (a: Vector3, b: Vector3, c: Vector3, d: Vector3): void => {
    const first = face * CORNER_COUNT;
    const normal = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(d, a));
    const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
    for (const [corner, point] of [a, b, c, d].entries()) {
      const target = (first + corner) * COORDINATE_COUNT;
      positions[target] = point.x;
      positions[target + 1] = point.y;
      positions[target + 2] = point.z;
      normals[target] = normal.x / length;
      normals[target + 1] = normal.y / length;
      normals[target + 2] = normal.z / length;
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
  // A side of a sunk slab faces into the opening it is cut in, so its corners run the other way round
  const addSide = (a: Vector3, b: Vector3, c: Vector3, d: Vector3): void => {
    if (isSunk) addFace(d, c, b, a);
    else addFace(a, b, c, d);
  };
  for (let segment = 0; segment < segmentCount; segment += 1) {
    const turn = getTurn(segment);
    const nextTurn = getTurn(segment + 1);
    // Its face, then its top and its foot between the wall and that face
    addFace(
      writeCorner(turn, faceRadius, bottom),
      writeCorner(nextTurn, faceRadius, bottom),
      writeCorner(nextTurn, faceRadius, top),
      writeCorner(turn, faceRadius, top),
    );
    addSide(
      writeCorner(turn, outerRadius, top),
      writeCorner(nextTurn, outerRadius, top),
      writeCorner(nextTurn, innerRadius, top),
      writeCorner(turn, innerRadius, top),
    );
    addSide(
      writeCorner(turn, innerRadius, bottom),
      writeCorner(nextTurn, innerRadius, bottom),
      writeCorner(nextTurn, outerRadius, bottom),
      writeCorner(turn, outerRadius, bottom),
    );
  }
  // Its two ends, facing back and on round the tower
  addSide(
    writeCorner(startTurn, innerRadius, bottom),
    writeCorner(startTurn, outerRadius, bottom),
    writeCorner(startTurn, outerRadius, top),
    writeCorner(startTurn, innerRadius, top),
  );
  addSide(
    writeCorner(endTurn, outerRadius, bottom),
    writeCorner(endTurn, innerRadius, bottom),
    writeCorner(endTurn, innerRadius, top),
    writeCorner(endTurn, outerRadius, top),
  );
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
