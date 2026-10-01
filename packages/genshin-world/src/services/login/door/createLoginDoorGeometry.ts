import door from "#src/data/login/door.json";
import { BufferGeometry, ExtrudeGeometry, ShapePath } from "three";

// A part's face extruded from its back to its front: each of its loops a ring of the face, those running
// Counterclockwise solid and those running clockwise the holes through them
const extrudePart = ({
  depth: [back = 0, front = 0],
  loops,
}: {
  depth: number[];
  loops: number[][][];
}): BufferGeometry => {
  const face = new ShapePath();
  for (const [[firstX = 0, firstY = 0] = [], ...rest] of loops) {
    face.moveTo(firstX, firstY);
    for (const [x = 0, y = 0] of rest) face.lineTo(x, y);
  }
  return new ExtrudeGeometry(face.toShapes(true), { bevelEnabled: false, depth: front - back }).translate(0, 0, back);
};
// The door at the flight's end as its two parts, standing on its foot on zero, each its face as the game's mesh draws
// It seen from the front, extruded through its depth: the stone frame round its opening, and the panel recessed within
// It, which lights when the door opens
export const createLoginDoorGeometry = (): { frame: BufferGeometry; panel: BufferGeometry } => ({
  frame: extrudePart(door.frame),
  panel: extrudePart(door.panel),
});
