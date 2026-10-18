import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";
import type { Wildlife } from "#src/models/wildlife/Wildlife";

// A hit of the striker's felled an animal in the world, which a weapon's passives answer, and an artifact set answers only where it is one of the sets the wiki names, such as Bloodstained Chivalry
export interface KitWildlifeStruckEvent {
  kind: KitEventKind.WildlifeStruck;
  striker: Combatant;
  wildlife: Wildlife;
}
