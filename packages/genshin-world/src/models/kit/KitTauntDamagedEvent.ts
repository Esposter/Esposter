import type { KitEventKind } from "#src/models/kit/KitEventKind";
import type { KitTaunt } from "#src/models/kit/KitTaunt";

// A taunt on the team took an enemy's strike: the taunt and the damage the strike dealt it
export interface KitTauntDamagedEvent {
  damage: number;
  kind: KitEventKind.TauntDamaged;
  taunt: KitTaunt;
}
