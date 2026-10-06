import type { BufferGeometry } from "three";

// One piece of the door as it rises into place: what it holds of the stone frame round the door's opening and of the
// Panel recessed within it, either empty where the piece holds none of it
export interface LoginDoorPieceGeometry {
  frame: BufferGeometry;
  panel: BufferGeometry;
}
