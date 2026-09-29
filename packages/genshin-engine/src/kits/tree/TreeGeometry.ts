import type { BufferGeometry } from "three";

export interface TreeGeometry {
  branchGeometry: BufferGeometry;
  leafGeometry: BufferGeometry;
}
