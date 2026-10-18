import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { spendVerdantDew } from "#src/services/party/spendVerdantDew";

// Measured: gcsim (MIT) lauma/skill.go, the Frostgrove Sanctuary standing 15 seconds, and each of its ticks shedding the
// RES below for 10 seconds
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const SANCTUARY_SECONDS = 15;
const SHRED_SECONDS = 10;
const SHRED_STATUS_ID = "lauma-skill-shred";

// Measured: gcsim (MIT) lauma/skill.go, Hymn of Eternal Rest's hold spends up to three Verdant Dew. The Dew is spent as
// The hold starts, where gcsim spends it at 29 frames, since the hit's multiplier is set as it is cast. A hold with no
// Dew plays the press, as gcsim refuses it
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const SKILL_HOLD_MAXIMUM_DEW_COUNT = 3;

// Measured: gcsim (MIT) lauma/asc.go, her Moonsign Benediction turns the party's Bloom into Lunar-Bloom and adds 0.0175%
// Base DMG Bonus to its Lunar-Bloom for each point of her Elemental Mastery, at most 14%
// Https://github.com/genshinsim/gcsim/tree/main/internal/characters/lauma
const BENEDICTION_BASE_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.000175;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;
// Cleansing for the Spring, Lauma's Ascension 4 passive as its text gives it: her Elemental Skill's DMG rises by 0.04% for
// Each point of her Elemental Mastery, to at most 32%
const ASCENSION_4 = 4;
const CLEANSING_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.0004;
const CLEANSING_MAXIMUM_DAMAGE_BONUS = 0.32;

export const LAUMA_CHARACTER_ID = 10_000_119;

// Lauma's behaviour: Hymn of Hunting's press and its hold each plant the Frostgrove Sanctuary where she stands, whose
// Ticks add the table's share of her Elemental Mastery, and every hit of the skill's sheds the table's Dendro and Hydro
// RES. Hymn of Eternal Rest plays while the party holds Verdant Dew, spending up to three on a direct Lunar-Bloom hit
// Following her, its multiplier of her Elemental Mastery for each Dew spent. Her Moonsign Benediction adds Base DMG Bonus
// For her Elemental Mastery. Not built yet: Pale Hymn's buff on Bloom and Lunar-Bloom hits, with the Moon Song Hymn of
// Eternal Rest's Dew gives it; the Spirit Envoy state her charged attack's first press enters, which waits on a stance
// That drains stamina; Light for the Frosty Night and her constellations; the Spirit Envoy's cooldown reduction of Cleansing
// For the Spring, as the charged attack's cooldown is not read by a kit
// Constellation 1 needs the Threads of Life heal on Lunar-Bloom reactions and the Spirit Envoy's stamina, not built
// Constellation 2 needs the Pale Hymn stacks her burst gains and the Bloom bonus they give, which are not built
// Constellation 4 needs a hit event from the Sanctuary's ticks to restore her energy, which no kit event carries
// Constellation 6 needs the Pale Hymn stacks and an extra Lunar-Bloom Dendro hit per Sanctuary attack, not built
export const createLaumaKitBehaviour = ({ readHitFields, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const shredResistanceReduction = readParameter("frostgroveSanctuaryResistanceDecrease");
  const sanctuaryTickElementalMasteryShare = readParameter("frostgroveSanctuaryElementalMasteryShare");
  const holdLunarBloomMultiplier = readParameter("hymnOfEternalRestLunarBloomMultiplier");
  // The RES Dendro and Hydro enemies lose to a hit of the skill's, for its seconds
  const createShredStatus = (): EnemyStatus => ({
    damageTakenBonus: 0,
    id: SHRED_STATUS_ID,
    resistanceReduction: { [Element.Dendro]: shredResistanceReduction, [Element.Hydro]: shredResistanceReduction },
    secondsRemaining: SHRED_SECONDS,
  });
  const shredBehaviour: KitHitBehaviour = { enemyStatus: createShredStatus };
  // The Frostgrove Sanctuary's ticks, each a Dendro hit of the sanctuary's ATK share and its Elemental Mastery
  const sanctuaryTicks = readHits("frostgroveSanctuaryTicks", {
    additiveBaseDamageBonus: (striker) =>
      striker.attributes.attributeTotalMap[Attribute.ElementalMastery] * sanctuaryTickElementalMasteryShare,
    enemyStatus: createShredStatus,
  });
  // The hold's direct Lunar-Bloom hit, whose multiplier is set by the Dew it spends as it is cast
  const holdLunarBloomFields = readHitFields("hymnOfEternalRestLunarBloom", ["talentMultiplier"]);
  const createHoldLunarBloomHit = (dewCount: number): KitHit => ({
    ...holdLunarBloomFields,
    enemyStatus: createShredStatus,
    talentMultiplier: holdLunarBloomMultiplier * dewCount,
  });
  // The Frostgrove Sanctuary the press and the hold each plant where she stands, its ticks striking as her Elemental Skill,
  // As gcsim v2.47.2 (MIT) lauma/skill.go tags them, so Cleansing for the Spring reaches them
  const plantSanctuary = ({ activeCombatant: combatant, body, kitEffectState }: KitContext): void => {
    castKitSummon(kitEffectState, body, combatant, sanctuaryTicks, {
      attackTag: AttackTag.ElementalSkill,
      secondsRemaining: SANCTUARY_SECONDS,
    });
  };
  const pressBehaviour: KitActionBehaviour = { hits: [shredBehaviour], onStart: plantSanctuary };
  return {
    getStrikeDamageBonus: ({ attackTag, combatant }) =>
      combatant.ascension < ASCENSION_4 || attackTag !== AttackTag.ElementalSkill
        ? 0
        : Math.min(
            CLEANSING_MAXIMUM_DAMAGE_BONUS,
            CLEANSING_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY *
              combatant.attributes.attributeTotalMap[Attribute.ElementalMastery],
          ),
    moonsignBenediction: {
      getBaseDamageBonus: (combatant) =>
        Math.min(
          combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] *
            BENEDICTION_BASE_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY,
          BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS,
        ),
    },
    skill: pressBehaviour,
    // A hold with no Dew plays the press, and with Dew Hymn of Eternal Rest, spending it on its Lunar-Bloom hit
    skillHolds: [
      {
        ...pressBehaviour,
        variant: {
          checkIsActive: ({ party }) => party.verdantDew.count > 0,
          hits: [shredBehaviour],
          onStart: (context) => {
            plantSanctuary(context);
            const dewCount = spendVerdantDew(context.party, SKILL_HOLD_MAXIMUM_DEW_COUNT);
            castKitSummon(
              context.kitEffectState,
              context.body,
              context.activeCombatant,
              [createHoldLunarBloomHit(dewCount)],
              { isFollowing: true },
            );
          },
        },
      },
    ],
  };
};
