import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { describe } from "vitest";

// A hit the striker lands on the enemy, which triggers the given reactions on it, as a gadget's if it is one
export const createReactionTrigger =
  (enemy: Enemy, context: KitContext) =>
  (striker: Combatant, reactionTypes: ReactionType[], isGadget?: true): void => {
    emitKitEvent(
      {
        enemy,
        isGadget,
        kind: KitEventKind.ReactionTriggered,
        reactions: reactionTypes.map((reactionType) => ({ reactionType })),
        striker,
      },
      context,
    );
  };

describe.todo("createReactionTrigger");
