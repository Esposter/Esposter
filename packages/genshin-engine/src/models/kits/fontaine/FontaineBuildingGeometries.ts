import type { BufferGeometry } from "three";

// A building as one geometry per material it is drawn in, standing on the origin at its footprint's centre
export interface FontaineBuildingGeometries {
  awningGeometry: BufferGeometry;
  goldGeometry: BufferGeometry;
  ironGeometry: BufferGeometry;
  slateGeometry: BufferGeometry;
  stoneGeometry: BufferGeometry;
}
