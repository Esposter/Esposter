import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";

export const DEHYA_CHARACTER_ID = 10_000_079;

// Stalwart and True, from Ascension 4: a drain that takes Dehya under 40% of her HP heals her 20% of her Max HP at once and
// 6% on each of five ticks, every 2 seconds for 10, and it can be triggered once every 20 seconds, as gcsim (MIT) does
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dehya/asc.go
const ASCENSION_4 = 4;
const STALWART_AND_TRUE_THRESHOLD = 0.4;
const STALWART_AND_TRUE_COOLDOWN_SECONDS = 20;
const STALWART_AND_TRUE_COOLDOWN_STATUS_ID = "dehya-stalwart-and-true-cooldown";
const STALWART_AND_TRUE_INITIAL_HEAL_SHARE = 0.2;
const STALWART_AND_TRUE_TICK_HEAL_SHARE = 0.06;
const STALWART_AND_TRUE_TICK_INTERVAL_SECONDS = 2;
const STALWART_AND_TRUE_TICK_COUNT = 5;

// Dehya's behaviour: none of her own, since her strikes, charged attack, plunges and Molten Inferno's initial hit are her
// Record's alone. Stalwart and True is built as her drain's hook. Not built: the Sanctum Molten Inferno leaves, with its
// DoT and Redmane's Blood's mitigation, Ranging Flame's reposition, the burst's Flame-Mane's Fists and Incineration Drive.
// Her Ascension 1 passive waits on the Sanctum
export const createDehyaKitBehaviour = (): KitBehaviour => ({
  onKitEvent: (event, context, combatant) => {
    if (
      event.kind !== KitEventKind.HealthChanged ||
      event.characterId !== combatant.characterId ||
      event.healthShare >= 0 ||
      combatant.ascension < ASCENSION_4
    )
      return;
    const { characterId, attributes } = combatant;
    const { kitEffectState, party } = context;
    if (getPartyMember(party, characterId).healthShare >= STALWART_AND_TRUE_THRESHOLD) return;
    if (
      !startKitCooldown(
        kitEffectState,
        characterId,
        STALWART_AND_TRUE_COOLDOWN_STATUS_ID,
        STALWART_AND_TRUE_COOLDOWN_SECONDS,
      )
    )
      return;
    changeKitMemberHealth(context, combatant, characterId, STALWART_AND_TRUE_INITIAL_HEAL_SHARE * attributes.maxHealth);
    for (const tick of Array.from({ length: STALWART_AND_TRUE_TICK_COUNT }, (_, index) => index + 1))
      scheduleKitTask(kitEffectState, characterId, tick * STALWART_AND_TRUE_TICK_INTERVAL_SECONDS, (tickContext) =>
        changeKitMemberHealth(
          tickContext,
          combatant,
          characterId,
          STALWART_AND_TRUE_TICK_HEAL_SHARE * attributes.maxHealth,
        ),
      );
  },
});
