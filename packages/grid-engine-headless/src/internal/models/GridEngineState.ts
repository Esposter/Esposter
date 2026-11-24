import type { GridEngineCharacter } from "#src/internal/models/GridEngineCharacter";
import type { GridEngineEvents } from "#src/models/GridEngineEvents";

// Everything an engine holds: its characters by id in the order they were added, the grid, and each event's listeners.
export interface GridEngineState {
  characters: Map<string, GridEngineCharacter>;
  listeners: { [TEvent in keyof GridEngineEvents]: Set<(payload: GridEngineEvents[TEvent]) => void> };
  tiles: readonly (readonly (boolean | undefined)[])[];
}
