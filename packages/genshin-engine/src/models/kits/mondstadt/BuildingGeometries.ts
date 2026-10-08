import type { BufferGeometry } from "three";

// A building's parts grouped by the material each is drawn in, so one building is one draw per material
export interface BuildingGeometries {
  plaster: BufferGeometry;
  roof: BufferGeometry;
  stone: BufferGeometry;
  timber: BufferGeometry;
}
