import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
import type { GroundPoint } from "genshin-engine";

// A Dendro Core a Bloom left by its enemy, which bursts as its seconds run out: the character whose stats price the
// Burst, the reaction it bursts as, its Bloom's own or the Burgeon or Hyperbloom an element on it made of it, where it
// Stands, and its seconds, counted from the reaction
export interface KitDendroCore {
  characterId: number;
  // Which kind of Dendro Core this is, by what left it
  coreKind: DendroCoreKind;
  kind: "dendroCore";
  position: GroundPoint;
  reactionType: TransformativeReactionType;
  secondsRemaining: number;
}
