// One part a witness family draws: its mesh, where it stands in three's axes, and where the middle of its bounding box's
// Top lands on the screen, from 0 to 1 across and down
export interface WitnessPart {
  mesh: string;
  position: [number, number, number];
  screen: [number, number];
}
