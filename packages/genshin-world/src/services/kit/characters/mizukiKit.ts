import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

export const MIZUKI_CHARACTER_ID = 10_000_109;

// The Dreamdrifter state her press starts lasts five seconds, as gcsim (MIT) mizuki/skill.go's dreamDrifterBaseDuration
// Gives it, and its id is gcsim's dreamDrifterStateKey
const DREAMDRIFTER_STATUS_ID = "dreamdrifter-state";
const DREAMDRIFTER_SECONDS = 5;

// Mizuki's behaviour: her skill's press enters the Dreamdrifter state for five seconds, and a press in it cancels the state,
// As gcsim's Skill does. Not built: the clouds of Anemo that drift from her press and strike every 45 frames after their
// First hit at 18 frames, since the kit holds neither the clouds' talent multiplier nor gcsim's cloud timings, which the
// Builder does not read yet; the state's restriction of her actions to swap, dash and burst; the snacks her burst leaves,
// Which are pick-ups the kit has no entity for; and the Swirl buff. The skill's activation hit still strikes on a press
// That cancels the state, since the kit plays one action per press, as the other kits' exit presses do
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mizuki
// Constellation 1 needs the Dreamdrifter state and its Twenty-Three Nights' Awaiting effect, which are not built
// Constellation 2 needs the Dreamdrifter state's Elemental Mastery bonus for the party, which is not built
// Constellation 4 needs the Yumemi Style Special Snacks from her burst, which the kit does not build
// Constellation 6 needs the Dreamdrifter state and a CRIT hook on the Swirl, which the kit does not build
export const createMizukiKitBehaviour = (): KitBehaviour => ({
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      if (checkIsKitStatusActive(kitEffectState.effects, characterId, DREAMDRIFTER_STATUS_ID))
        removeKitEffects(
          kitEffectState,
          (effect) =>
            effect.kind === "status" && effect.characterId === characterId && effect.id === DREAMDRIFTER_STATUS_ID,
        );
      else
        addKitStatus(kitEffectState, characterId, {
          id: DREAMDRIFTER_STATUS_ID,
          secondsRemaining: DREAMDRIFTER_SECONDS,
        });
    },
  },
});
