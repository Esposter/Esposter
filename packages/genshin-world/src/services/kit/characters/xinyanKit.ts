import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { takeOne } from "@esposter/shared";

// The count Sweeping Fervor keeps as it strikes lasts this long past the press, long enough for its one hit to strike
// Every enemy it reaches
const SKILL_HIT_WINDOW_SECONDS = 0.5;
// The shield's level is raised by the enemies Sweeping Fervor hits: Lead-In at 2 and Rave at 3, Ascension 1 lowering each
// By one, and the shield stands at level 1 without one
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/xinyan.go
const LEAD_IN_ENEMY_COUNT = 2;
const RAVE_ENEMY_COUNT = 3;
const ASCENSION_SHIELD_REQUIREMENT_ASCENSION = 1;
const SHIELD_LEVEL_ONE = 1;
const SHIELD_LEVEL_TWO = 2;
const SHIELD_LEVEL_THREE = 3;
// Rave's DoT strikes every 2 seconds while the shield stands at level 3, from the second after it is set
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/skill.go
const SHIELD_DOT_INTERVAL_SECONDS = 2;
// The field lives a tenth of a second past its last tick, so the step that runs it still has it
const FIELD_LINGER_SECONDS = 0.1;
const SHIELD_LEVEL_STATUS_ID = "xinyan-shield-level";
const HIT_COUNT_STATUS_ID = "xinyan-sweeping-fervor-hits";
const SHIELD_DOT_FIELD_ID = "xinyan-shield-dot";

// Constellation gates, as gcsim v2.47.2 (MIT) gives them: 1's ATK SPD is not built, as the kit's normal attack speed reads
// Only an infusion's, 2's Riff Revolution CRIT Rate and shield, and 4's Physical RES cut. Constellation 6 has no gcsim
// Implementation, so it is not built
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/cons.go
const CRITICAL_RATE_CONSTELLATION = 2;
const SHIELD_ON_BURST_CONSTELLATION = 2;
const PHYSICAL_RESISTANCE_CONSTELLATION = 4;
const RIFF_CRITICAL_RATE_BONUS = 1;
const RIFF_CRITICAL_RATE_SOURCE = "xinyan-riff-revolution";
const PHYSICAL_RESISTANCE_REDUCTION = 0.15;
const PHYSICAL_RESISTANCE_SECONDS = 12;
const PHYSICAL_RESISTANCE_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "xinyan-c4",
  physicalResistanceReduction: PHYSICAL_RESISTANCE_REDUCTION,
  secondsRemaining: PHYSICAL_RESISTANCE_SECONDS,
};
const getPhysicalResistanceStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= PHYSICAL_RESISTANCE_CONSTELLATION ? PHYSICAL_RESISTANCE_STATUS : undefined;

// The level of Sweeping Fervor's shield a count of enemies hit raises it to, lowered by Ascension 1
const getRequiredShieldLevel = (hitCount: number, ascension: number): number => {
  const reduction = ascension >= ASCENSION_SHIELD_REQUIREMENT_ASCENSION ? 1 : 0;
  if (hitCount >= RAVE_ENEMY_COUNT - reduction) return SHIELD_LEVEL_THREE;
  if (hitCount >= LEAD_IN_ENEMY_COUNT - reduction) return SHIELD_LEVEL_TWO;
  return SHIELD_LEVEL_ONE;
};

// The shield a character holds on the team and the level it stands at, zero without a live one. The level is a status
// Beside the shield, lasting as long as it, so a shield that breaks or runs out takes its level with it
const findShieldLevel = (effects: readonly KitEffect[], characterId: number): number => {
  if (!effects.some((effect) => checkIsKitShieldLive(effect) && effect.characterId === characterId)) return 0;
  return findKitStatus(effects, characterId, SHIELD_LEVEL_STATUS_ID)?.stacks ?? SHIELD_LEVEL_ONE;
};

export const XINYAN_CHARACTER_ID = 10_000_044;

// Xinyan's behaviour: Sweeping Fervor sets her level-1 shield when none stands, and each enemy its hit strikes steps the
// Shield's level up, lowered by Ascension 1, its health read off the table at the level it stands at, and Rave's field
// Striking every 2 seconds while it stands at level 3. Riff Revolution casts its Pyro DoT, a summon that follows the
// Body. Constellation 2 gives its Physical hit CRIT Rate and sets Rave's shield as it is cast, its DoT striking Rave's
// Two pulses besides, and Constellation 4's skill hit cuts Physical RES. Her Ascension 4 is not built, as no kit event
// Reaches the team's shield, and her Constellations 1 and 6 are not built, each set out below
// Constellation 1 needs an ATK SPD bonus on her normal and charged attacks, which no attribute carries
// Constellation 6 needs the Charged Attacks' stamina cut and ATK bonus, which the kit does not build
export const createXinyanKitBehaviour = ({
  kit,
  readHitFields,
  readHits,
  readParameter,
  readParameters,
}: KitRecordReader): KitBehaviour => {
  const riffInitialHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const riffDotHits = readHits("riffDot");
  const constellationDotHits = readHits("impromptuOpeningRiffRevolutionDots");
  // Rave's DoT hit is the pulse Constellation 2 adds to Riff Revolution's DoT, struck a frame after the field's tick
  const shieldDotHit: KitHit = {
    ...takeOne(constellationDotHits, riffDotHits.length),
    ...readHitFields("shieldDot", ["talentMultiplier"]),
  };
  const shieldSeconds = readParameter("shieldSeconds");
  // The shield's share of DEF and flat HP at each level from 1, picked by the level the shield is set at as she plays
  const shieldDefenseShares = readParameters("shieldDefenseShares");
  const shieldFlatHealths = readParameters("shieldFlatHealths");
  // Sets a shield at a level, its health its flat HP plus its share of DEF at that level, and at level 3 starts the field
  // That strikes each 2 seconds while it stands, the earlier fields of the same kind ending
  const setShield = (kitEffectState: KitEffectState, combatant: Combatant, body: KitBody, level: number): void => {
    const { characterId } = combatant;
    const defenseShare = takeOne(shieldDefenseShares, level - 1);
    const flatHealth = takeOne(shieldFlatHealths, level - 1);
    castKitShield(kitEffectState, characterId, {
      element: Element.Pyro,
      health: flatHealth + defenseShare * combatant.attributes.defense,
      secondsRemaining: shieldSeconds,
    });
    addKitStatus(kitEffectState, characterId, {
      id: SHIELD_LEVEL_STATUS_ID,
      secondsRemaining: shieldSeconds,
      stacks: level,
    });
    if (level < SHIELD_LEVEL_THREE) return;
    for (const effect of kitEffectState.effects)
      if (effect.kind === "field" && effect.id === SHIELD_DOT_FIELD_ID) effect.secondsRemaining = 0;
    const centre = { x: body.position.x, z: body.position.z };
    castKitField(kitEffectState, characterId, centre, {
      id: SHIELD_DOT_FIELD_ID,
      nextTickSeconds: SHIELD_DOT_INTERVAL_SECONDS,
      onTick: ({ kitEffectState: tickState }) => {
        if (findShieldLevel(tickState.effects, characterId) !== SHIELD_LEVEL_THREE) return;
        castKitSummon(tickState, { facing: 0, height: 0, position: centre }, combatant, [shieldDotHit], {
          isFollowing: true,
        });
      },
      secondsRemaining: shieldSeconds + FIELD_LINGER_SECONDS,
      tickIntervalSeconds: SHIELD_DOT_INTERVAL_SECONDS,
    });
  };
  return {
    // Riff Revolution's DoT is a summon that follows the body, struck from the cast as its hits fall. At Constellation 2
    // The shield is set as the burst is cast, with the Physical hit's CRIT Rate for the moment it lands
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.constellationCount >= CRITICAL_RATE_CONSTELLATION)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: RIFF_CRITICAL_RATE_BONUS,
            attribute: Attribute.CriticalRate,
            secondsRemaining: riffInitialHitmarkSeconds + FIELD_LINGER_SECONDS,
            source: RIFF_CRITICAL_RATE_SOURCE,
          });
        const hasShieldOnBurst = combatant.constellationCount >= SHIELD_ON_BURST_CONSTELLATION;
        if (hasShieldOnBurst) setShield(kitEffectState, combatant, body, SHIELD_LEVEL_THREE);
        castKitSummon(kitEffectState, body, combatant, hasShieldOnBurst ? constellationDotHits : riffDotHits, {
          isFollowing: true,
        });
      },
    },
    skill: {
      hits: [
        {
          enemyStatus: getPhysicalResistanceStatus,
          // Each enemy the hit strikes counts toward the shield's level, which the hit steps up as the count reaches each
          // Level
          onStrike: ({ kitEffectState }, { body, combatant }) => {
            const hitCount = findKitStatus(kitEffectState.effects, combatant.characterId, HIT_COUNT_STATUS_ID);
            if (!hitCount) return;
            hitCount.stacks = (hitCount.stacks ?? 0) + 1;
            const requiredLevel = getRequiredShieldLevel(hitCount.stacks, combatant.ascension);
            if (requiredLevel > findShieldLevel(kitEffectState.effects, combatant.characterId))
              setShield(kitEffectState, combatant, body, requiredLevel);
          },
        },
      ],
      // The press sets the level-1 shield when none stands, and resets the count its hit adds to
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (findShieldLevel(kitEffectState.effects, combatant.characterId) === 0)
          setShield(kitEffectState, combatant, body, SHIELD_LEVEL_ONE);
        addKitStatus(kitEffectState, combatant.characterId, {
          id: HIT_COUNT_STATUS_ID,
          secondsRemaining: SKILL_HIT_WINDOW_SECONDS,
          stacks: 0,
        });
      },
    },
  };
};
