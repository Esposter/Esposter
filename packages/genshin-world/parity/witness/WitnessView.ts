// A view of the witness render as the tools set it: a camera pose (the eye in three's axes, its heading about y and its
// Pitch about x in radians, its vertical field of view in degrees), the families of parts the witness draws in place of
// The scene's own (every family it has unless told), and whether the scene draws alone, without its own fog, clouds
// And cloud sea; and how far each family of its parts stands off its laid-out place, in metres in three's axes, for a
// Family's place to be solved on its edges (every family at its own place unless told)
export interface WitnessView {
  camera?: { fov: number; pitch: number; position: [number, number, number]; yaw: number };
  families?: string[];
  familyOffsets?: Record<string, [number, number, number]>;
  // How many times each family's parts are scaled about their own places, each at once
  familyScales?: Record<string, number>;
  isAlone?: boolean;
}
