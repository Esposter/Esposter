import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";

// Everything an engine holds, by the characters' ids in the order they were added
export interface GridEngineState {
  characters: Map<string, GridEngineCharacter>;
  tiles: readonly (readonly (boolean | undefined)[])[];
}
