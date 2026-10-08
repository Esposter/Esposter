import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Attribute } from "#src/models/character/Attribute";
import type { AttributeLine } from "#src/models/character/AttributeLine";

// An artifact the player has: the set and the piece it is, its rarity in stars and its enhancement level from 0, the
// Attribute its main affix raises, at the value its rarity and level give, and its up to four minor affixes, each at
// The value its rolls summed to. Its experience is every EXP it has been levelled with, and a locked one is never fodder
export interface Artifact {
  experience: number;
  isLocked: boolean;
  level: number;
  mainAffix: Attribute;
  minorAffixes: AttributeLine[];
  rarity: number;
  setId: number;
  slot: ArtifactSlot;
}
