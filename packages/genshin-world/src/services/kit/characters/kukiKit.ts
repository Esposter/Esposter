import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim (MIT) kuki/skill.go, Grass Ring of Sanctification lasts 3 seconds more from Constellation 2
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kuki
const RING_CONSTELLATION = 2;
const RING_CONSTELLATION_SECONDS = 3;
// The ring's field id: a second cast restarts the ring it finds, as gcsim keeps one Grass Ring status for her skill
const RING_FIELD_ID = "kuki-grass-ring";
// Measured: gcsim (MIT) kuki/skill.go, Kuki drains 30% of her current HP as she casts, but no further than to 20% of her
// Max HP. Her HP is a party member's health share, so the drain reads it at the cast's first step
const HP_DRAIN_SHARE = 0.3;
const HP_DRAIN_FLOOR_SHARE = 0.2;
// Measured: gcsim (MIT) kuki/asc.go, from Ascension 4 the ring's healing is raised by 75% of Elemental Mastery and its tick's
// DMG by 25% of it, and the initial hit's DMG by 25% of it at every ascension
const ASCENSION_4 = 4;
// Breaking Free, Kuki's Ascension 1 passive as its text gives it: Healing Bonus +15% while her HP is at or under 50%
const ASCENSION_1 = 1;
const BREAKING_FREE_HEALTH_SHARE = 0.5;
const BREAKING_FREE_HEALING_BONUS = 0.15;
const ASCENSION_4_HEALING_ELEMENTAL_MASTERY_SHARE = 0.75;
const ASCENSION_4_DAMAGE_ELEMENTAL_MASTERY_SHARE = 0.25;
const INITIAL_HIT_ELEMENTAL_MASTERY_SHARE = 0.25;
// Measured: gcsim (MIT) kuki/burst.go, Constellation 1 widens Gyoei Narukami Kariyama Rite's hits
const BURST_CONSTELLATION = 1;
// Measured: gcsim (MIT) kuki/burst.go, the burst casts twelve hits rather than seven at half her HP or less
const BURST_HALF_HEALTH_SHARE = 0.5;
const BURST_LOW_HEALTH_HIT_COUNT = 12;

export const KUKI_CHARACTER_ID = 10_000_065;

// Breaking Free raises her Healing Bonus at Ascension 1 while her HP is at or under half
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_1 || healthShare > BREAKING_FREE_HEALTH_SHARE
    ? []
    : [{ amount: BREAKING_FREE_HEALING_BONUS, attribute: Attribute.HealingBonus }];

// The burst's hits at half her HP or less: the record's, then each further one a gap on from the last, as gcsim's loop
// Casts them. The gap is the record's own between its last two hits
const toLowHealthBurstHits = (hits: KitHit[]): KitHit[] => {
  const lastHit = hits.at(-1);
  const previousHit = hits.at(-2);
  if (!lastHit || !previousHit) return hits;
  const gapSeconds = lastHit.hitmarkSeconds - previousHit.hitmarkSeconds;
  return [
    ...hits,
    ...Array.from({ length: BURST_LOW_HEALTH_HIT_COUNT - hits.length }, (_value, index) => ({
      ...lastHit,
      hitmarkSeconds: lastHit.hitmarkSeconds + (index + 1) * gapSeconds,
    })),
  ];
};

// Kuki's behaviour: Grass Ring of Sanctification's HP drain and its ring with the ring's Ascension 4 bonuses, the initial
// Hit's share of Elemental Mastery, Gyoei Narukami Kariyama Rite's hits and Breaking Free's Healing Bonus. Constellations
// 1 and 2 are built. Constellations 4 and 6 are not, as each reads her HP
// Constellation 4 needs charged and plunging hits as events, which only normal attacks emit
// Constellation 6 needs a lethal hit held at 1 HP once a minute, which damage taken does not allow
export const createKukiKitBehaviour = ({
  readHit,
  readHits,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const ringBaseSeconds = readParameter("ringSeconds");
  const ringMaxHealthHealingShare = readParameter("grassRingMaxHealthHealingShare");
  const ringFlatHealing = readParameter("grassRingFlatHealing");
  const ringStartSeconds = readSeconds("ringStart");
  const ringFirstTickSeconds = readSeconds("ringNextTick");
  const ringTickIntervalSeconds = readSeconds("ringTickInterval");
  // Each tick's DMG lands from a summon, with a share of the striker's Elemental Mastery from Ascension 4
  const ringTickHit = readHit("ringTick", {
    additiveBaseDamageBonus: (striker) =>
      striker.ascension >= ASCENSION_4
        ? elementalMasteryMultiplier(striker, ASCENSION_4_DAMAGE_ELEMENTAL_MASTERY_SHARE)
        : 0,
  });
  // The burst's hits, and Constellation 1's wider ones, which her health share at the cast picks as seven or twelve
  const burstHits = readHits("gyoeiNarukamiKariyamaRite");
  const constellationBurstHits = readHits("toCloisterCompassionGyoeiNarukamiKariyamaRite");

  // The ring ticks from its first tick each interval, and each tick's DMG and healing reads the ring's caster as it stood at
  // The cast, with its heal from the caster's Max HP and its Elemental Mastery at Ascension 4
  const castRing = (
    kitEffectState: KitEffectState,
    { facing, height, position }: KitBody,
    combatant: Combatant,
  ): void => {
    const ringSeconds =
      ringBaseSeconds + (combatant.constellationCount >= RING_CONSTELLATION ? RING_CONSTELLATION_SECONDS : 0);
    castKitField(kitEffectState, combatant.characterId, position, {
      id: RING_FIELD_ID,
      nextTickSeconds: ringFirstTickSeconds,
      onTick: (tick) => {
        const ascensionHealing =
          combatant.ascension >= ASCENSION_4
            ? elementalMasteryMultiplier(combatant, ASCENSION_4_HEALING_ELEMENTAL_MASTERY_SHARE)
            : 0;
        const maxHealth = getKitMaxHealth(
          combatant,
          tick.kitEffectState.effects,
          tick.party,
          tick.characterIdCombatantMap,
        );
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          ringMaxHealthHealingShare * maxHealth + ringFlatHealing + ascensionHealing,
        );
        castKitSummon(tick.kitEffectState, { facing, height, position }, combatant, [ringTickHit], {
          attackTag: AttackTag.ElementalSkill,
        });
      },
      secondsRemaining: ringStartSeconds + ringSeconds + SUMMON_LINGER_SECONDS,
      tickIntervalSeconds: ringTickIntervalSeconds,
    });
  };

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState, party }) => {
        const hits = combatant.constellationCount >= BURST_CONSTELLATION ? constellationBurstHits : burstHits;
        const { healthShare } = getPartyMember(party, combatant.characterId);
        castKitSummon(
          kitEffectState,
          body,
          combatant,
          healthShare <= BURST_HALF_HEALTH_SHARE ? toLowHealthBurstHits(hits) : hits,
          { attackTag: AttackTag.ElementalBurst },
        );
      },
    },
    getPassiveBonuses,
    skill: {
      hits: [
        {
          additiveBaseDamageBonus: (striker) =>
            elementalMasteryMultiplier(striker, INITIAL_HIT_ELEMENTAL_MASTERY_SHARE),
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { characterId } = combatant;
        scheduleKitTask(kitEffectState, characterId, 0, ({ party }) => {
          const { healthShare } = getPartyMember(party, characterId);
          if (healthShare <= HP_DRAIN_FLOOR_SHARE) return;
          damagePartyMember(
            party,
            characterId,
            Math.min(healthShare * HP_DRAIN_SHARE, healthShare - HP_DRAIN_FLOOR_SHARE),
          );
        });
        castRing(kitEffectState, body, combatant);
      },
    },
  };
};
