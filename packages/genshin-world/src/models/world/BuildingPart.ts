import type { BufferGeometry } from "three";

// One geometry of a building and the colour of the material it is drawn in, so a building is one draw per material
export interface BuildingPart {
  color: number;
  geometry: BufferGeometry;
}
