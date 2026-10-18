import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Attribute } from "#src/models/character/Attribute";
import type { AttributeLine } from "#src/models/character/AttributeLine";

// A reliquary a trial template names, as the artifact it is worn as: its set and slot, its rarity in stars, its level counted
// From zero, the main stat it raises and the sub-stats it carries at the values the game gives them
export interface TrialReliquary {
  id: number;
  level: number;
  mainAffix: Attribute;
  minorAffixes: AttributeLine[];
  rarity: number;
  setId: number;
  slot: ArtifactSlot;
}
