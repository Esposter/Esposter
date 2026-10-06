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
// What stands out from a tower's wall as a slab of its own: a curved prism from a little inside the wall out to its
// Depth, over the turns its span covers round a tower of that breadth and up its height, each face flat-shaded so its
// Edges stand sharp as carved stone's do. Its inside stands within the wall and is never seen, so it is not drawn. Each
// Face is four corners of its own and two triangles, indexed as the lathe it is merged with is
export const createLoginTowerColumnGeometry = (
  { depth, radius, round: [roundFrom = 0, roundTo = 0], up: [bottom = 0, top = 0] }: TowerSlab,
  breadth: number,
): BufferGeometry => {
  const [startTurn, endTurn] = [roundFrom / breadth, roundTo / breadth];
  const segmentCount = Math.max(1, Math.ceil((endTurn - startTurn) * LOGIN_TOWER_RADIAL_SEGMENTS));
  const turns = Array.from(
    { length: segmentCount + 1 },
    (_value, index) => startTurn + ((endTurn - startTurn) * index) / segmentCount,
  );
  const [innerRadius, outerRadius] = [radius - LOGIN_TOWER_COLUMN_EMBED, radius + depth];
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
  for (const [index, turn] of turns.entries()) {
    const nextTurn = turns[index + 1];
    if (nextTurn === undefined) break;
    // Its outer face, then its top and its foot between the wall and that face
    addFace(
      toCorner(turn, outerRadius, bottom),
      toCorner(nextTurn, outerRadius, bottom),
      toCorner(nextTurn, outerRadius, top),
      toCorner(turn, outerRadius, top),
    );
    addFace(
      toCorner(turn, outerRadius, top),
      toCorner(nextTurn, outerRadius, top),
      toCorner(nextTurn, innerRadius, top),
      toCorner(turn, innerRadius, top),
    );
    addFace(
      toCorner(turn, innerRadius, bottom),
      toCorner(nextTurn, innerRadius, bottom),
      toCorner(nextTurn, outerRadius, bottom),
      toCorner(turn, outerRadius, bottom),
    );
  }
  // Its two ends, facing back and on round the tower
  addFace(
    toCorner(startTurn, innerRadius, bottom),
    toCorner(startTurn, outerRadius, bottom),
    toCorner(startTurn, outerRadius, top),
    toCorner(startTurn, innerRadius, top),
  );
  addFace(
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
