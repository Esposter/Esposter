import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
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
// "...Now That's Rock 'N' Roll!", as the dump's Xinyan_PermanentSkill_2 row (promote 4) and gcsim v2.47.2 (MIT)
// Xinyan/asc.go give it: from Ascension 4, characters shielded by Sweeping Fervor deal 15% more Physical DMG, for as long
// As the shield stands
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xinyan/asc.go
const ROCK_N_ROLL_ASCENSION = 4;
const ROCK_N_ROLL_PHYSICAL_DAMAGE_BONUS = 0.15;
const ROCK_N_ROLL_SOURCE = "xinyan-a4";

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
// Two pulses besides, and Constellation 4's skill hit cuts Physical RES. From Ascension 4 the team deals more Physical DMG
// While her shield stands. Her Constellation 1 is not built, as the kit's normal attack speed reads only an infusion's,
// And Constellation 6 is not, as gcsim has none
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
  // That strikes each 2 seconds while it stands, the earlier fields of the same kind ending. From Ascension 4 the team
  // It shields deals more Physical DMG for the shield's seconds, ended sooner if it breaks
  const setShield = (
    { kitEffectState, party }: Pick<KitContext, "kitEffectState" | "party">,
    combatant: Combatant,
    body: KitBody,
    level: number,
  ): void => {
    const { characterId } = combatant;
    const defenseShare = takeOne(shieldDefenseShares, level - 1);
    const flatHealth = takeOne(shieldFlatHealths, level - 1);
    castKitShield(kitEffectState, characterId, {
      element: Element.Pyro,
      health: flatHealth + defenseShare * combatant.attributes.defense,
      secondsRemaining: shieldSeconds,
    });
    if (combatant.ascension >= ROCK_N_ROLL_ASCENSION)
      buffKitTeam(kitEffectState, party, {
        amount: ROCK_N_ROLL_PHYSICAL_DAMAGE_BONUS,
        attribute: Attribute.PhysicalDamageBonus,
        secondsRemaining: shieldSeconds,
        source: ROCK_N_ROLL_SOURCE,
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
      onStart: (context) => {
        const { activeCombatant: combatant, body, kitEffectState } = context;
        if (combatant.constellationCount >= CRITICAL_RATE_CONSTELLATION)
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: RIFF_CRITICAL_RATE_BONUS,
            attribute: Attribute.CriticalRate,
            secondsRemaining: riffInitialHitmarkSeconds + FIELD_LINGER_SECONDS,
            source: RIFF_CRITICAL_RATE_SOURCE,
          });
        const hasShieldOnBurst = combatant.constellationCount >= SHIELD_ON_BURST_CONSTELLATION;
        if (hasShieldOnBurst) setShield(context, combatant, body, SHIELD_LEVEL_THREE);
        castKitSummon(kitEffectState, body, combatant, hasShieldOnBurst ? constellationDotHits : riffDotHits, {
          isFollowing: true,
        });
      },
    },
    // Her shield's Physical DMG Bonus ends as the shield breaks, unless a shield of hers was set over it
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.EffectExpired ||
        event.effect.kind !== "shield" ||
        event.effect.characterId !== combatant.characterId ||
        kitEffectState.effects.some(
          (effect) => checkIsKitShieldLive(effect) && effect.characterId === combatant.characterId,
        )
      )
        return;
      removeKitEffects(kitEffectState, (effect) => effect.kind === "buff" && effect.source === ROCK_N_ROLL_SOURCE);
    },
    skill: {
      hits: [
        {
          enemyStatus: getPhysicalResistanceStatus,
          // Each enemy the hit strikes counts toward the shield's level, which the hit steps up as the count reaches each
          // Level
          onStrike: (context, { body, combatant }) => {
            const { kitEffectState } = context;
            const hitCount = findKitStatus(kitEffectState.effects, combatant.characterId, HIT_COUNT_STATUS_ID);
            if (!hitCount) return;
            hitCount.stacks = (hitCount.stacks ?? 0) + 1;
            const requiredLevel = getRequiredShieldLevel(hitCount.stacks, combatant.ascension);
            if (requiredLevel > findShieldLevel(kitEffectState.effects, combatant.characterId))
              setShield(context, combatant, body, requiredLevel);
          },
        },
      ],
      // The press sets the level-1 shield when none stands, and resets the count its hit adds to
      onStart: (context) => {
        const { activeCombatant: combatant, body, kitEffectState } = context;
        if (findShieldLevel(kitEffectState.effects, combatant.characterId) === 0)
          setShield(context, combatant, body, SHIELD_LEVEL_ONE);
        addKitStatus(kitEffectState, combatant.characterId, {
          id: HIT_COUNT_STATUS_ID,
          secondsRemaining: SKILL_HIT_WINDOW_SECONDS,
          stacks: 0,
        });
      },
    },
  };
};
