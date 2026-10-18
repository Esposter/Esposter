import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

export const CHEVREUSE_CHARACTER_ID = 10_000_090;

// Overloaded reactions set the Overcharged Ball going for the next hold, as gcsim's overcharged-ball subscription does,
// Whoever triggers them, until a hold casts the ball
const OVERCHARGED_BALL_STATUS_ID = "chevreuse-overcharged-ball";

// Chevreuse's behaviour: an Overloaded reaction sets the Overcharged Ball going, and the hold casts the ball in place of
// Its own shot while it is going, spending it
// Constellation 1 needs the Coordinated Tactics status on other members, which the kit does not apply
// Constellation 2 needs the chain explosions after Short-Range Rapid Interdiction Fire's hold hits a target, not built
// Constellation 4 needs the hold's cooldown exemption after Ring of Bursting Grenades, which no cooldown read holds
// Constellation 6 needs the hold's 12-second healing effect and the team heals it triggers, which are not built
export const createChevreuseKitBehaviour = (): KitBehaviour => ({
  // Overloaded from any source sets the ball going on the team's Chevreuse, as gcsim's subscription does, until a hold
  // Casts it. The status has no end, so it stands until a hold spends it
  onKitEvent: (event, { kitEffectState }, combatant) => {
    if (
      event.kind !== KitEventKind.ReactionTriggered ||
      !event.reactions.some(({ reactionType }) => reactionType === ReactionType.Overloaded)
    )
      return;
    if (checkHasKitStatus(kitEffectState.effects, combatant.characterId, OVERCHARGED_BALL_STATUS_ID)) return;
    addKitStatus(kitEffectState, combatant.characterId, {
      id: OVERCHARGED_BALL_STATUS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
    });
  },
  skillHolds: [
    {
      variant: {
        checkIsActive: ({ activeCombatant: combatant, kitEffectState }) =>
          checkHasKitStatus(kitEffectState.effects, combatant.characterId, OVERCHARGED_BALL_STATUS_ID),
        // The Overcharged Ball's hold spends the ball as it starts, so the next hold is a plain one again
        onStart: ({ kitEffectState }) =>
          removeKitEffects(
            kitEffectState,
            (effect) => effect.kind === "status" && effect.id === OVERCHARGED_BALL_STATUS_ID,
          ),
      },
    },
  ],
});
