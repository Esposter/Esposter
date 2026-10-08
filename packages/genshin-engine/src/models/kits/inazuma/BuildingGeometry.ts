import type { BufferGeometry } from "three";

// A building as one geometry per material: its timber frame and floors, its plaster panels and its roof
export interface BuildingGeometry {
  plasterGeometry: BufferGeometry;
  roofGeometry: BufferGeometry;
  timberGeometry: BufferGeometry;
}
