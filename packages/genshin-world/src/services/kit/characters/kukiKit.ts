import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { SUMMON_LINGER_SECONDS } from "#src/services/kit/constants";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";

// Measured: gcsim (MIT) kuki/skill.go, Grass Ring of Sanctification lasts 3 seconds more from Constellation 2
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/kuki
const RING_CONSTELLATION = 2;
const RING_CONSTELLATION_SECONDS = 3;
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

export const KUKI_CHARACTER_ID = 10_000_065;

const getElementalMastery = ({ attributes }: Combatant): number =>
  attributes.attributeTotalMap[Attribute.ElementalMastery];

// Breaking Free raises her Healing Bonus at Ascension 1 while her HP is at or under half
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_1 || healthShare > BREAKING_FREE_HEALTH_SHARE
    ? []
    : [{ amount: BREAKING_FREE_HEALING_BONUS, attribute: Attribute.HealingBonus }];

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
      striker.ascension >= ASCENSION_4 ? ASCENSION_4_DAMAGE_ELEMENTAL_MASTERY_SHARE * getElementalMastery(striker) : 0,
  });
  // The burst's hits, and Constellation 1's wider ones. gcsim casts more while her HP is at 50% or less, which a kit with
  // No current HP cannot tell, so the healthy count stands
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
      nextTickSeconds: ringFirstTickSeconds,
      onTick: (tick) => {
        const ascensionHealing =
          combatant.ascension >= ASCENSION_4
            ? ASCENSION_4_HEALING_ELEMENTAL_MASTERY_SHARE * getElementalMastery(combatant)
            : 0;
        changeKitMemberHealth(
          tick,
          combatant,
          tick.activeCombatant.characterId,
          ringMaxHealthHealingShare * combatant.attributes.maxHealth + ringFlatHealing + ascensionHealing,
        );
        castKitSummon(tick.kitEffectState, { facing, height, position }, combatant, [ringTickHit]);
      },
      secondsRemaining: ringStartSeconds + ringSeconds + SUMMON_LINGER_SECONDS,
      tickIntervalSeconds: ringTickIntervalSeconds,
    });
  };

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        castKitSummon(
          kitEffectState,
          body,
          combatant,
          combatant.constellationCount >= BURST_CONSTELLATION ? constellationBurstHits : burstHits,
        ),
    },
    getPassiveBonuses,
    skill: {
      hits: [
        { additiveBaseDamageBonus: (striker) => INITIAL_HIT_ELEMENTAL_MASTERY_SHARE * getElementalMastery(striker) },
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
