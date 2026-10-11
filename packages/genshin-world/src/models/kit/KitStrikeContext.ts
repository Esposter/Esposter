import type { ActiveKitStepContext } from "#src/models/kit/ActiveKitStepContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

// What a strike on the enemies reads and writes: the deployed team and each member's combat, the enemies with the tables
// They are priced by, the effects on the team, the world's one seeded random source, and the channel the deployed team's
// Kits hear what the strike does through
export interface KitStrikeContext extends Pick<
  ActiveKitStepContext,
  "characterIdCombatantMap" | "enemyMap" | "enemyTables" | "kitEffectState" | "party" | "random"
> {
  emit: (event: KitEvent) => void;
}
