import type { BufferGeometry } from "three";

// The door's two parts: the stone frame round its opening, and the panel recessed within it
export interface LoginDoorGeometry {
  frame: BufferGeometry;
  panel: BufferGeometry;
}
