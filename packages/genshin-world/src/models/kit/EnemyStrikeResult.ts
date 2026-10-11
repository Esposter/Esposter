import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";

// What a kit hit, or a reaction reaching an enemy, leaves from its strike on one enemy: the energy the enemy dropped,
// Whether it was a CRIT hit, the reactions it triggered on it, which a passive that follows reactions reads, and those
// Of them that landed and reach round it
export interface EnemyStrikeResult {
  energyDrops: EnergyDrop[];
  isCritical: boolean;
  reachingReactions: TransformativeReaction[];
  reactions: Reaction[];
}
