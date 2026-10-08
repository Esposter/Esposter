import type { BufferGeometry } from "three";

// A building as one geometry per material: its stone terrace, the red lacquer of its columns, beams and lattice, and
// The tiles of its roofs with their ridge ornaments
export interface LiyueBuildingGeometries {
  lacquer: BufferGeometry;
  roof: BufferGeometry;
  stone: BufferGeometry;
}
