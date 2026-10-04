// A part a straight path passes through: its mesh, where it stands, and the depths along the path it enters and
// Leaves at
export interface PiercedPart {
  depths: number[];
  mesh: string;
  position: [number, number, number];
}
