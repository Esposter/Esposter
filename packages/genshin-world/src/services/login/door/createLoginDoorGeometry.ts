import type { LoginDoorGeometry } from "#src/models/login/LoginDoorGeometry";

import door from "#src/data/login/door.json";
import { BufferGeometry, Float32BufferAttribute, ShapePath, ShapeUtils, Vector2 } from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Corner = readonly [number, number, number];
// Faces meeting at under this angle shade as one surface, so a curve traced in short steps reads round, and the creases
// The game carves (a wall into its top, a chamfer into its face, a band's bevel into its top) stay sharp
const LOGIN_DOOR_CREASE_ANGLE = Math.PI / 6;
// A part as the layers its front stands out in, deepest first, its back the front mirrored: the deepest a slab with
// Straight sides through the part's middle, and each layer over it a step out from the one below, its top flat at its
// Depth and its wall leaning from each corner down to that corner's foot, or straight where it keeps none
const createReliefGeometry = (layers: typeof door.frame): BufferGeometry => {
  const positions: number[] = [];
  // A face as seen from the front, and its mirror on the back turned the other way round
  const addFace = (a: Corner, b: Corner, c: Corner, isMirrored = true): void => {
    positions.push(...a, ...b, ...c);
    if (isMirrored) positions.push(a[0], a[1], -a[2], c[0], c[1], -c[2], b[0], b[1], -b[2]);
  };
  for (const [index, { depth, loops }] of layers.entries()) {
    const path = new ShapePath();
    for (const { points } of loops) {
      const [[firstX = 0, firstY = 0] = [], ...rest] = points;
      path.moveTo(firstX, firstY);
      for (const [x = 0, y = 0] of rest) path.lineTo(x, y);
    }
    for (const shape of path.toShapes()) {
      const { holes, shape: contour } = shape.extractPoints(1);
      // A closed path ends where it began, which a triangulation takes once
      const rings = [contour, ...holes].map((ring) =>
        ring.at(-1)?.equals(ring[0] ?? new Vector2()) ? ring.slice(0, -1) : ring,
      );
      const [outer = [], ...inner] = rings;
      const ringPoints = rings.flat();
      for (const triangle of ShapeUtils.triangulateShape(outer, inner)) {
        const [a, b, c] = triangle.map((point) => ringPoints[point] ?? new Vector2());
        if (!a || !b || !c) continue;
        // Its top turned to the front, whichever way round the triangulation wound it
        const isCounterclockwise = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
        const [second, third] = isCounterclockwise ? [b, c] : [c, b];
        addFace([a.x, a.y, depth], [second.x, second.y, depth], [third.x, third.y, depth]);
      }
    }
    // The deepest layer's sides run straight through the middle to its back, the rest down to the layer below
    const isSlab = index === 0;
    const below = isSlab ? -depth : (layers[index - 1]?.depth ?? 0);
    for (const { foot, points } of loops)
      for (const [corner, [x = 0, y = 0]] of points.entries()) {
        const next = (corner + 1) % points.length;
        const [nextX = 0, nextY = 0] = points[next] ?? [];
        const [footX = x, footY = y] = foot[corner] ?? [];
        const [nextFootX = nextX, nextFootY = nextY] = foot[next] ?? [];
        addFace([x, y, depth], [footX, footY, below], [nextX, nextY, depth], !isSlab);
        addFace([nextX, nextY, depth], [footX, footY, below], [nextFootX, nextFootY, below], !isSlab);
      }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return toCreasedNormals(geometry, LOGIN_DOOR_CREASE_ANGLE);
};
// The door at the flight's end as its two parts, standing on its foot on zero, each built as the layers the game's
// Mesh carves its front in: the stone frame round its opening, its chamfer leaning in to the panel, and the panel
// Recessed within it with its raised bands, which lights when the door opens
export const createLoginDoorGeometry = (): LoginDoorGeometry => ({
  frame: createReliefGeometry(door.frame),
  panel: createReliefGeometry(door.panel),
});
