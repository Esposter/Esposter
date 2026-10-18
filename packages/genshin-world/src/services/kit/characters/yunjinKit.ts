import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { openKitCounterWindow } from "#src/services/kit/effects/openKitCounterWindow";
import { takeOne } from "@esposter/shared";

export const YUNJIN_CHARACTER_ID = 10_000_064;

const ASCENSION_1 = 1;
// Unsourced, provisional: gcsim (MIT) yunjin/asc.go leaves Ascension 1 unimplemented, so no gcsim parameter gives the
// Length of the counter window, and this half second is the kit's own value
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/yunjin
const ASCENSION_1_COUNTER_WINDOW_SECONDS = 0.5;
const ASCENSION_1_COUNTER_WINDOW_ID = "yunjin-ascension-1-counter-window";
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_DEFENSE_BONUS = 0.2;
const CONSTELLATION_4_SECONDS = 12;
const CONSTELLATION_4_SOURCE = "yunjin-constellation-4";

// Yun Jin's behaviour: Opening Flourish's tap and each of its two charge levels set a shield of her Max HP as they start.
// Cliffbreaker's Banner's DEF-scaled DMG Increase on each of the party's normal attacks, which the kit prices from the
// Striker's stats alone, is not built, nor her Ascension 4 passive. Ascension 1's counter window is built.
// Constellation 4's DEF is built, from her own Crystallize
// Constellation 1 needs the Opening Flourish cooldown cut, which the kit does not build
// Constellation 2 needs the Cliffbreaker's Banner's Normal Attack DMG bonus for the party, not built
// Constellation 6 needs a Normal Attack SPD bonus, which no attribute carries
export const createYunjinKitBehaviour = ({ kit, readParameter }: KitRecordReader): KitBehaviour => {
  const shieldShare = readParameter("shieldShare");
  const shieldFlat = readParameter("shieldFlatHealth");
  // Opening Flourish's shield is set as the skill starts, from Yun Jin's Max HP and the table's share and flat HP, until its
  // Hit lands, as gcsim expires it at that frame
  const createShieldOnStart = ({ hits }: KitAction): KitAction["onStart"] => {
    const shieldSeconds = takeOne(hits).hitmarkSeconds;
    return ({ activeCombatant: combatant, characterIdCombatantMap, kitEffectState, party }) =>
      castKitShield(kitEffectState, combatant.characterId, {
        element: Element.Geo,
        health:
          shieldShare * getKitMaxHealth(combatant, kitEffectState.effects, party, characterIdCombatantMap) + shieldFlat,
        secondsRemaining: shieldSeconds,
      });
  };
  return {
    // True to Oneself, from Ascension 1: a hit on her while her skill is held opens the window its release reads
    onKitEvent: (event, context, combatant) => {
      if (combatant.ascension >= ASCENSION_1)
        openKitCounterWindow(context, event, combatant.characterId, {
          id: ASCENSION_1_COUNTER_WINDOW_ID,
          seconds: ASCENSION_1_COUNTER_WINDOW_SECONDS,
        });
      // Flower and a Fighter, from Constellation 4: her own Crystallize or Lunar-Crystallize gives her 20% DEF for 12 seconds
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        event.striker.characterId !== combatant.characterId ||
        combatant.constellationCount < CONSTELLATION_4 ||
        !event.reactions.some(
          ({ reactionType }) =>
            reactionType === ReactionType.Crystallize || reactionType === LunarReactionType.LunarCrystallize,
        )
      )
        return;
      buffKitMember(context.kitEffectState, combatant.characterId, {
        amount: CONSTELLATION_4_DEFENSE_BONUS,
        attribute: Attribute.DefensePercent,
        secondsRemaining: CONSTELLATION_4_SECONDS,
        source: CONSTELLATION_4_SOURCE,
      });
    },
    // While the window stands, her skill's release plays its top level, whatever seconds it was held
    jumpsSkillHoldToTop: ({ activeCombatant, kitEffectState }) =>
      checkIsKitStatusActive(kitEffectState.effects, activeCombatant.characterId, ASCENSION_1_COUNTER_WINDOW_ID),
    skill: { onStart: createShieldOnStart(kit.elementalSkill) },
    skillHolds: (kit.elementalSkillHolds ?? []).map(({ action }) => ({ onStart: createShieldOnStart(action) })),
  };
};
