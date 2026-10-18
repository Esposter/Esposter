import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// Measured: gcsim (MIT) shenhe/burst.go, Divine Maiden's Deliverance's field centred 2 metres ahead of the body, its DoT
// Ticking two hits each tick, the second its tick's offset on from the first, and the field's Ascension 1 Cryo DMG Bonus
// Of 15% for an active character inside it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/shenhe
const BURST_OFFSET_METRES = 2;
const BURST_ASCENSION = 1;
const BURST_CRYO_DAMAGE_BONUS = 0.15;
const BURST_CRYO_DAMAGE_BONUS_SOURCE = "shenhe-burst-cryo";
const CONSTELLATION_1 = 1;

export const SHENHE_CHARACTER_ID = 10_000_063;

// Shenhe's behaviour: Divine Maiden's Deliverance casts its field ahead of her, whose DoT ticks give the enemies within it
// The burst's RES Decrease and, from Ascension 1, give the active character its Cryo DMG Bonus. Her Quill is not built:
// The kit prices a hit from its striker alone, and a Quill adds Shenhe's ATK to the hits of whoever carries it, which no
// Kit step reads. Constellation 1's charge is built; her other passives and Constellations 2, 4 and 6 are not
// Constellation 2 needs the field's extra 6 seconds and a Cryo CRIT DMG bonus, which no strike hook carries
// Constellation 4 needs the Skyfrost Mantra stacks from the Icy Quill, which the kit does not build
// Constellation 6 needs the Icy Quill's trigger quota, which the kit does not build
export const createShenheKitBehaviour = ({
  readHitFields,
  readParameter,
  readSeconds,
  readSecondsList,
}: KitRecordReader): KitBehaviour => {
  const burstDurationSeconds = readParameter("talismanSpiritSeconds");
  const burstResistanceReduction = readParameter("talismanSpiritResistanceReduction");
  const burstStartSeconds = readSeconds("talismanSpiritStart");
  const burstFirstTickSeconds = readSeconds("talismanSpiritFirstTick");
  const fieldTickIntervalSeconds = readSeconds("talismanSpiritTickInterval");
  const burstTickSecondHitSeconds = readSeconds("talismanSpiritTickSecondHit");
  // The Cryo and Physical RES Decrease a DoT tick gives, held for the tick interval until the next tick
  const burstResistanceStatus: EnemyStatus = {
    damageTakenBonus: 0,
    id: "shenhe-burst-shred",
    physicalResistanceReduction: burstResistanceReduction,
    resistanceReduction: { [Element.Cryo]: burstResistanceReduction },
    secondsRemaining: fieldTickIntervalSeconds,
  };
  const burstTickFields = readHitFields("talismanSpiritTick", ["hitmarkSeconds"]);
  const createBurstTickHit = (hitmarkSeconds: number): KitHit => ({
    ...burstTickFields,
    enemyStatus: () => burstResistanceStatus,
    hitmarkSeconds,
  });
  // Each tick's two hits, the second at its tick's offset, the offsets taken in turn
  const burstTicks = readSecondsList("talismanSpiritTickSecondHitOffsets").map((offsetSeconds) => [
    createBurstTickHit(0),
    createBurstTickHit(burstTickSecondHitSeconds + offsetSeconds),
  ]);
  return {
    // Clarity of Heart, from Constellation 1, lets Spring Spirit Summoning be used one more time
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
    burst: {
      // The field is cast ahead of the body, as far across as its DoT reaches, and its DoT and buff are summoned there, so
      // It stands where gcsim places it
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const centreBody = createAheadBody(body, BURST_OFFSET_METRES);
        castKitField(kitEffectState, combatant.characterId, centreBody.position, {
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ activeCombatant, kitEffectState: tickEffectState }, tickIndex) => {
            if (combatant.ascension >= BURST_ASCENSION)
              buffKitMember(tickEffectState, activeCombatant.characterId, {
                amount: BURST_CRYO_DAMAGE_BONUS,
                attribute: Attribute.CryoDamageBonus,
                secondsRemaining: fieldTickIntervalSeconds,
                source: BURST_CRYO_DAMAGE_BONUS_SOURCE,
              });
            castKitSummon(tickEffectState, centreBody, combatant, takeOne(burstTicks, tickIndex % burstTicks.length));
          },
          radius: burstTickFields.hitArea.radius,
          secondsRemaining: burstDurationSeconds + burstStartSeconds + 0.1,
          tickIntervalSeconds: fieldTickIntervalSeconds,
        });
      },
    },
  };
};
