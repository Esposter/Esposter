import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A Nightsoul burst went off on an enemy, set off by a party member's elemental hit on it while a Natlan character is in the
// Party and the interval since the last burst has run out, with the combatant whose hit set it off
export interface KitNightsoulBurstEvent {
  enemy: Enemy;
  kind: KitEventKind.NightsoulBurst;
  striker: Combatant;
}
