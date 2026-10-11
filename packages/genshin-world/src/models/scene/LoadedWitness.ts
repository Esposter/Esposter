import type { Group } from "three";

// A component's exports as the witness draws them, in a group per family, and how to free every geometry, material and
// Texture they were loaded into once nothing draws them
export interface LoadedWitness {
  dispose: () => void;
  parts: Group;
}
