import type { Reaction } from "#src/models/combat/Reaction";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";

// What a kit hit leaves from its strike on one enemy: the energy the enemy dropped, and the reactions the hit triggered
// On it, which a passive that follows reactions reads
export interface EnemyStrikeResult {
  energyDrops: EnergyDrop[];
  reactions: Reaction[];
}
