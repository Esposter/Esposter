import type { LoadedWitness } from "#src/models/scene/LoadedWitness";
import type { Box3 } from "three";

// A component's exports as the world draws them, with each family's extent in the world's own coordinates, which the
// Landmarks it stands in for are found within
export interface SceneExport extends LoadedWitness {
  familyBoundsMap: ReadonlyMap<string, Box3>;
}
