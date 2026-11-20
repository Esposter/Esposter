import type { CharacterConfig } from "#src/models/CharacterConfig";

// A tile is blocking (true), open (false), or absent on every layer (undefined), and an absent tile blocks
export interface GridEngineConfig {
  characters?: CharacterConfig[];
  tiles: readonly (readonly (boolean | undefined)[])[];
}
