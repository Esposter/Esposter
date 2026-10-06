import type { TowerSlab } from "#src/models/login/TowerSlab";

import { LOGIN_TOWER_COLUMN_EMBED, LOGIN_TOWER_RADIAL_SEGMENTS } from "#src/services/login/tower/constants";
import { BufferGeometry, Float32BufferAttribute } from "three";

type Corner = [number, number, number];
// A point round the tower's axis at a turn from +z toward +x, as three's lathe turns, a radius out and a height up
const toCorner = (turn: number, radius: number, y: number): Corner => [
  radius * Math.sin(turn * 2 * Math.PI),
  y,
  radius * Math.cos(turn * 2 * Math.PI),
];
// A slab of a tower's wall as geometry of its own, over the turns its span covers round a tower of that breadth and up
// Its height, each face flat-shaded so its edges stand sharp as carved stone's do. One standing out, a rib or a pilaster,
// Is a curved prism from a little inside the wall out to its depth, its inside within the wall and never drawn; one sunk
// In, a window or a bay, is the box behind the lathe's opening, its back turned out and its sides turned into it. Each
// Face is four corners of its own and two triangles, indexed as the lathe it is merged with is
export const createLoginTowerSlabGeometry = (
  { depth, radius, round: [roundFrom = 0, roundTo = 0], up: [bottom = 0, top = 0] }: TowerSlab,
  breadth: number,
  { isSunk = false }: { isSunk?: boolean } = {},
): BufferGeometry => {
  // The fit rounds a span to its facade's cells, so one ending at the seam can run on past a whole turn: it stops at the
  // Seam, where its last corners stand a hair short of it as the lathe's do and read its tile's far edge
  const [startTurn, endTurn] = [roundFrom / breadth, Math.min(roundTo / breadth, 1)];
  const segmentCount = Math.max(1, Math.ceil((endTurn - startTurn) * LOGIN_TOWER_RADIAL_SEGMENTS));
  const turns = Array.from(
    { length: segmentCount + 1 },
    (_value, index) => startTurn + ((endTurn - startTurn) * index) / segmentCount,
  );
  // A slab standing out runs from inside the wall to its face; one sunk in from its back to the wall, where the lathe is
  // Cut open over it
  const [innerRadius, outerRadius] = isSunk
    ? [radius - depth, radius]
    : [radius - LOGIN_TOWER_COLUMN_EMBED, radius + depth];
  const faceRadius = isSunk ? innerRadius : outerRadius;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  // A face from its four corners, counter-clockwise seen from outside, lit by the normal its first triangle faces
  const addFace = (a: Corner, b: Corner, c: Corner, d: Corner): void => {
    const first = positions.length / 3;
    const [edgeX, edgeY, edgeZ] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const [otherX, otherY, otherZ] = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    const normal = [edgeY * otherZ - edgeZ * otherY, edgeZ * otherX - edgeX * otherZ, edgeX * otherY - edgeY * otherX];
    const length = Math.hypot(...normal) || 1;
    for (const corner of [a, b, c, d]) {
      positions.push(...corner);
      normals.push(...normal.map((value) => value / length));
    }
    indices.push(first, first + 1, first + 2, first, first + 2, first + 3);
  };
  // A side between the wall and the face, turned to face into the opening where the slab is sunk
  const addSide = (a: Corner, b: Corner, c: Corner, d: Corner): void => {
    if (isSunk) addFace(d, c, b, a);
    else addFace(a, b, c, d);
  };
  for (const [index, turn] of turns.entries()) {
    const nextTurn = turns[index + 1];
    if (nextTurn === undefined) break;
    // Its face, then its top and its foot between the wall and that face
    addFace(
      toCorner(turn, faceRadius, bottom),
      toCorner(nextTurn, faceRadius, bottom),
      toCorner(nextTurn, faceRadius, top),
      toCorner(turn, faceRadius, top),
    );
    addSide(
      toCorner(turn, outerRadius, top),
      toCorner(nextTurn, outerRadius, top),
      toCorner(nextTurn, innerRadius, top),
      toCorner(turn, innerRadius, top),
    );
    addSide(
      toCorner(turn, innerRadius, bottom),
      toCorner(nextTurn, innerRadius, bottom),
      toCorner(nextTurn, outerRadius, bottom),
      toCorner(turn, outerRadius, bottom),
    );
  }
  // Its two ends, facing back and on round the tower
  addSide(
    toCorner(startTurn, innerRadius, bottom),
    toCorner(startTurn, outerRadius, bottom),
    toCorner(startTurn, outerRadius, top),
    toCorner(startTurn, innerRadius, top),
  );
  addSide(
    toCorner(endTurn, outerRadius, bottom),
    toCorner(endTurn, innerRadius, bottom),
    toCorner(endTurn, innerRadius, top),
    toCorner(endTurn, outerRadius, top),
  );
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  // The lathe it is merged with carries texture coordinates, which the facade's own attribute stands in for
  geometry.setAttribute("uv", new Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2));
  geometry.setIndex(indices);
  return geometry;
};
