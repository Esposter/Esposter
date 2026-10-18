import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A hit triggered reactions on an enemy: the reactions, the kind of attack of the strike that triggered them, none for a reaction
// A reach carries, and the combatant that dealt the hit
export interface KitReactionTriggeredEvent {
  attackTag?: AttackTag;
  enemy: Enemy;
  kind: KitEventKind.ReactionTriggered;
  reactions: Reaction[];
  striker: Combatant;
}
