import type { ArtifactSlot } from "genshin-world";

// A reliquary of the game's reliquary table as a trial reads it: its rarity in stars, the set it belongs to, zero where
// The table names none, and the slot it is worn in
export interface TrialReliquaryPiece {
  rarity: number;
  setId: number;
  slot: ArtifactSlot;
}
