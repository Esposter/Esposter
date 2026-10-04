// A view of the witness render as the parity page's `setWitnessView` takes it: a camera pose in three's axes (angles in
// Radians but the field of view, in degrees), the families of parts the witness draws in place of the scene's own,
// Whether the scene draws alone, and how far each family stands off its place
export interface PageWitnessView {
  camera?: { fov: number; pitch: number; position: [number, number, number]; yaw: number };
  families?: string[];
  familyOffsets?: Record<string, [number, number, number]>;
  familyScales?: Record<string, number>;
  isAlone?: boolean;
}
