import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit triggered reactions on an enemy: the reactions, and the combatant that dealt the hit
export interface KitReactionTriggeredEvent {
  enemy: Enemy;
  kind: KitEventKind.ReactionTriggered;
  reactions: Reaction[];
  striker: Combatant;
}
