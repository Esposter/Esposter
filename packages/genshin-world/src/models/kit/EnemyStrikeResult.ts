import type { Reaction } from "#src/models/combat/Reaction";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";

// What a kit hit leaves from its strike on one enemy: the energy the enemy dropped, whether the hit was a CRIT hit, and
// The reactions the hit triggered on it, which a passive that follows reactions reads
export interface EnemyStrikeResult {
  energyDrops: EnergyDrop[];
  isCritical: boolean;
  reactions: Reaction[];
}
