import type { Element } from "#src/models/Element";
import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";

// What a kit hit, or a reaction reaching an enemy, leaves from its strike on one enemy: the element the hit applied, if
// It applied one, the energy the enemy dropped, whether it was a CRIT hit, the reactions it triggered on it, which a
// Passive that follows reactions reads, and those of them that landed and reach round it
export interface EnemyStrikeResult {
  appliedElement?: Element;
  energyDrops: EnergyDrop[];
  isCritical: boolean;
  reachingReactions: TransformativeReaction[];
  reactions: Reaction[];
}
