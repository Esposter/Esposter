import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { describe } from "vitest";

// The kit's event carries the reaction a striker triggers on an enemy, one of the given type and element.
export const createReaction = (striker: Combatant, enemy: Enemy, reactionType: ReactionType, element: Element) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered,
  reactions: [{ element, reactionType }],
  striker,
});

describe.todo("createReaction");
