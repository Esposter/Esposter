import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { openKitCounterWindow } from "#src/services/kit/effects/openKitCounterWindow";
import { takeOne } from "@esposter/shared";

export const YUNJIN_CHARACTER_ID = 10_000_064;

// Measured: gcsim (MIT) yunjin/burst.go, Cliffbreaker's Banner lasts 720 frames from its hitmark, with 30 stacks, each
// Normal attack hit spending one while it stands, and yunjin/zz_yunjin.dm.go gives its DEF share 0.3216 at the talent
// Level the record reads, the level of its 2.44 burst multiplier
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yunjin/burst.go
const BANNER_SECONDS = 12;
const BANNER_STACKS = 30;
const BANNER_DEFENSE_SHARE = 0.3216;
const BANNER_STATUS_ID = "yunjin-cliffbreaker-banner";
// Measured: gcsim (MIT) yunjin/asc.go, Ascension 4 adds 2.5%, 5% and 7.5% of her DEF for one to three Elemental Types
// In the party, and 11.5% for four
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yunjin/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_DEFENSE_SHARES = [0.025, 0.05, 0.075, 0.115];
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

// Whether the banner stands on a character: its status running, with a stack left for the increase to spend
const checkIsBannerStanding = (effects: readonly KitEffect[], characterId: number): boolean =>
  checkIsKitStatusActive(effects, characterId, BANNER_STATUS_ID) &&
  countKitResource(effects, characterId, BANNER_STATUS_ID) > 0;

// Spends one of the banner's stacks, as each enemy a normal attack of any member's damages does while it stands
const spendBannerStack = (effects: readonly KitEffect[], characterId: number): void => {
  const banner = findKitStatus(effects, characterId, BANNER_STATUS_ID);
  if (banner) banner.stacks = countKitResource(effects, characterId, BANNER_STATUS_ID) - 1;
};

// Ascension 4's share of her DEF for the Elemental Types the deployed team holds, as her combatant reads the team
// As it stands
const getAscension4DefenseShare = ({ ascension, deployedElements = [] }: Combatant): number => {
  if (ascension < ASCENSION_4) return 0;
  const elementCount = new Set(deployedElements.flatMap((element) => (element === undefined ? [] : [element]))).size;
  return ASCENSION_4_DEFENSE_SHARES[elementCount - 1] ?? 0;
};

// The banner's flat base damage on a normal attack, its share of Yun Jin's DEF with Ascension 4's share on top
const getBannerIncrease = (banner: Combatant): number =>
  (BANNER_DEFENSE_SHARE + getAscension4DefenseShare(banner)) * banner.attributes.defense;

// Yun Jin's behaviour: Opening Flourish's tap and each of its two charge levels set a shield of her Max HP as they start.
// Cliffbreaker's Banner's DEF-scaled DMG Increase is party-wide, as gcsim gives it: her own normal attacks take it through
// her strike hook and a teammate's through the party strike hook, with Ascension 4's share of the Elemental Types on top
// Ascension 1's counter window is built.
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
    // Cliffbreaker's Banner is set as the burst starts, its seconds counted from its hit, as gcsim counts them from the
    // Hitmark: the burst's animation holds a normal attack past that hit, so nothing reads the banner before it lands
    burst: {
      onStart: ({ activeCombatant, kitEffectState }) =>
        addKitStatus(kitEffectState, activeCombatant.characterId, {
          id: BANNER_STATUS_ID,
          secondsRemaining: takeOne(kit.elementalBurst.hits).hitmarkSeconds + BANNER_SECONDS,
          stacks: BANNER_STACKS,
        }),
    },
    // True to Oneself, from Ascension 1: a hit on her while her skill is held opens the window its release reads
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind === KitEventKind.DamageTaken &&
        event.attackTag === AttackTag.NormalAttack &&
        checkIsBannerStanding(context.kitEffectState.effects, combatant.characterId)
      )
        spendBannerStack(context.kitEffectState.effects, combatant.characterId);
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
    // The banner's DMG Increase on her own normal attacks while it stands, priced from the striker as its buffs leave it
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, _party, effects) =>
      strike.attackTag === AttackTag.NormalAttack && checkIsBannerStanding(effects, strike.combatant.characterId)
        ? getBannerIncrease(strike.combatant)
        : 0,
    // The banner's DMG Increase on a teammate's normal attack while it stands, priced from Yun Jin's buffed DEF
    getPartyStrikeBonus: (member, strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (strike.attackTag !== AttackTag.NormalAttack || !checkIsBannerStanding(effects, member.characterId)) return {};
      const buffedMember = getBuffedCombatant(member, effects, party, characterIdCombatantMap);
      return { additiveBaseDamageBonus: getBannerIncrease(buffedMember) };
    },
    // While the window stands, her skill's release plays its top level, whatever seconds it was held
    jumpsSkillHoldToTop: ({ activeCombatant, kitEffectState }) =>
      checkIsKitStatusActive(kitEffectState.effects, activeCombatant.characterId, ASCENSION_1_COUNTER_WINDOW_ID),
    skill: { onStart: createShieldOnStart(kit.elementalSkill) },
    skillHolds: (kit.elementalSkillHolds ?? []).map(({ action }) => ({ onStart: createShieldOnStart(action) })),
  };
};
