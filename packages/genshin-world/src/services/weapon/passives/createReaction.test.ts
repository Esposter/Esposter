import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { describe } from "vitest";

// The reaction a striker triggers on an enemy, one reaction of the given type and element, as the kit's event carries it
export const createReaction = (striker: Combatant, enemy: Enemy, reactionType: ReactionType, element: Element) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element, reactionType }],
  striker,
});

describe.todo("createReaction");
