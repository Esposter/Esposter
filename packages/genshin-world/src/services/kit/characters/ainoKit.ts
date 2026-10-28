import type { ReactionType } from "#src/models/combat/ReactionType";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// Measured: gcsim (MIT) aino/burst.go, Cool Your Jets Ducky's Water Balls fall for 14.2 seconds from the first, each on a
// Random enemy within 10 metres of the body. Ascension 1's faster and wider balls at Ascendant Gleam are read as the burst
// Is cast
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/aino
const ASCENSION_4 = 4;
// Ascension 1 at Ascendant Gleam, as gcsim's aino/asc.go gives the balls: one every 0.7 seconds, each landing with a radius
// Of 4 metres where the base ball's is 1
const ASCENSION_1 = 1;
const ASCENSION_1_WATER_BALL_INTERVAL_SECONDS = 0.7;
const ASCENSION_1_WATER_BALL_RADIUS = 4;
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_COOLDOWN_SECONDS = 10;
const CONSTELLATION_4_ENERGY = 10;
const CONSTELLATION_4_STATUS_ID = "aino-constellation-4";
// Constellation 1: 80 Elemental Mastery on Aino for fifteen seconds after her skill or burst, and on the member a swap brings on
// While it runs, as gcsim (MIT) aino/cons.go gives it. The status is the clock, and the buff is sourced to it so a recast restarts it
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_MASTERY = 80;
const CONSTELLATION_1_SECONDS = 15;
const CONSTELLATION_1_STATUS_ID = "aino-constellation-1";
// Constellation 2, The Principle of Transference in Gear Differentials: the water ball's Attack and Elemental Mastery shares
// Are the dump's paramList 0.25 and 1.0, and its cooldown 5 seconds, as gcsim (MIT) aino/cons.go gives them with a 1.5 metre circle
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ATTACK_SHARE = 0.25;
const CONSTELLATION_2_MASTERY_SHARE = 1;
const CONSTELLATION_2_COOLDOWN_ID = "aino-constellation-2-cooldown";
const CONSTELLATION_2_COOLDOWN_SECONDS = 5;
const CONSTELLATION_2_RADIUS = 1.5;
// The field Precision Hydronic Cooler casts, which Constellation 2 reads for as long as it stands
const BURST_FIELD_ID = "aino-precision-hydronic-cooler";
// Constellation 6, The Burden of Creative Genius: for fifteen seconds after her burst, the reactions the active member makes
// Deal 15% more DMG, and 20% more at Ascendant Gleam, as the dump's paramList 0.15, 0.2 and 15 give and gcsim's aino/cons.go does
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_DAMAGE_BONUS = 0.15;
const CONSTELLATION_6_ASCENDANT_GLEAM_DAMAGE_BONUS = 0.2;
const CONSTELLATION_6_SECONDS = 15;
const CONSTELLATION_6_STATUS_ID = "aino-constellation-6";
// The reactions Constellation 6 raises: Electro-Charged and Bloom, and the Lunar reactions a Moonsign turns them into
const CONSTELLATION_6_REACTION_TYPES = new Set<ReactionType>([
  LunarReactionType.LunarBloom,
  LunarReactionType.LunarCharged,
  LunarReactionType.LunarCrystallize,
  TransformativeReactionType.Bloom,
  TransformativeReactionType.ElectroCharged,
]);

export const AINO_CHARACTER_ID = 10_000_121;

// Aino's behaviour: Cool Your Jets Ducky casts a field following the body, which drops a Water Ball every interval from
// Its first tick to its last, and Ascension 4 adds half her Elemental Mastery to each ball's damage. Ascension 1 at
// Ascendant Gleam drops the balls faster and wider, read as the burst is cast. Constellation 4 gives her 10 energy on each
// Skill hit that strikes an enemy, once every ten seconds, as gcsim does. Constellation 1 gives her, and the member on the field
// Through a swap, 80 Elemental Mastery for fifteen seconds after her skill or burst. Constellation 2 queues a water ball on each
// Enemy her active teammate hits while she is off the field and the burst's zone stands, once every five seconds. The ball
// Strikes the enemy it is queued on alone, where gcsim's circle of 1.5 metres also reaches the enemies beside it. Constellation
// 6 raises the reactions the active member makes for fifteen seconds after the burst. Musecatcher's hold is not built, as gcsim
// Does not implement it either
export const createAinoKitBehaviour = ({ kit, readHit, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const masteryShare = readParameter("ascension4MasteryShare");
  const burstFirstTickSeconds = readSeconds("burstStart");
  // Gcsim queues each ball at its hitmark from the burst's start, a tick at a time, and a summon's hits count from its own
  // Spawn, so a ball lands its hitmark less the first tick's seconds past the tick that drops it
  const waterBallHit = readHit("waterBall", {
    additiveBaseDamageBonus: (combatant) =>
      combatant.ascension >= ASCENSION_4 ? elementalMasteryMultiplier(combatant, masteryShare) : 0,
  });
  const waterBall: KitHit = { ...waterBallHit, hitmarkSeconds: waterBallHit.hitmarkSeconds - burstFirstTickSeconds };
  const burstTickIntervalSeconds = readSeconds("waterBallInterval");
  const burstSeconds = readSeconds("burstDuration");
  const burstRadius = readParameter("burstRadius");
  // The ball Ascension 1 drops at Ascendant Gleam, whose reach is the burst's search radius with its own landing radius
  // Its moon hit is under its own internal cooldown, as gcsim gives it at Ascension 1 at Ascendant Gleam
  const ascendantWaterBall: KitHit = {
    ...waterBall,
    hitArea: { ...waterBall.hitArea, radius: burstRadius + ASCENSION_1_WATER_BALL_RADIUS },
    internalCooldownTag: InternalCooldownTag.AinoBurstMoonHit,
  };
  const { internalCooldownTag: _internalCooldownTag, ...waterBallWithoutCooldown } = waterBall;
  // Constellation 2's ball is the water ball, with the Attack and Elemental Mastery shares of its own in place of the burst's
  // Its ball has no internal cooldown, as gcsim's cons.go gives it
  const constellation2WaterBall: KitHit = {
    ...waterBallWithoutCooldown,
    additiveBaseDamageBonus: (combatant) =>
      (waterBall.additiveBaseDamageBonus?.(combatant) ?? 0) +
      elementalMasteryMultiplier(combatant, CONSTELLATION_2_MASTERY_SHARE),
    hitArea: { ...waterBall.hitArea, radius: CONSTELLATION_2_RADIUS },
    talentMultiplier: CONSTELLATION_2_ATTACK_SHARE,
  };
  const skillHits = kit.elementalSkill.hits;
  return {
    burst: {
      onStart: ({
        activeCombatant: combatant,
        body: { facing, height, position },
        characterIdCombatantMap,
        kitEffectState,
        party,
      }) => {
        const isAscendantBurst =
          combatant.ascension >= ASCENSION_1 &&
          getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
        const burstField = castKitField(kitEffectState, combatant.characterId, position, {
          id: BURST_FIELD_ID,
          isFollowing: true,
          nextTickSeconds: burstFirstTickSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) => {
            castKitSummon(
              tickKitEffectState,
              { facing, height, position: burstField.centre },
              combatant,
              [isAscendantBurst ? ascendantWaterBall : waterBall],
              { attackTag: AttackTag.ElementalBurst },
            );
          },
          radius: burstRadius,
          secondsRemaining: burstFirstTickSeconds + burstSeconds,
          tickIntervalSeconds: isAscendantBurst ? ASCENSION_1_WATER_BALL_INTERVAL_SECONDS : burstTickIntervalSeconds,
        });
        if (combatant.constellationCount >= CONSTELLATION_6)
          addKitStatus(kitEffectState, combatant.characterId, {
            id: CONSTELLATION_6_STATUS_ID,
            secondsRemaining: CONSTELLATION_6_SECONDS,
          });
      },
    },
    // Constellation 6: the Electro-Charged, Bloom and Lunar reactions the active member makes deal more DMG for fifteen seconds
    // After her burst, 20% more at Ascendant Gleam, as gcsim's aino/cons.go gives them
    getPartyReactionBonus: (
      member,
      { combatant, reactionType },
      { activeCombatant, characterIdCombatantMap, kitEffectState, party },
    ) => {
      if (
        !CONSTELLATION_6_REACTION_TYPES.has(reactionType) ||
        combatant.characterId !== activeCombatant.characterId ||
        !checkIsKitStatusActive(kitEffectState.effects, member.characterId, CONSTELLATION_6_STATUS_ID)
      )
        return {};
      const isAscendantGleam = getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
      return {
        damageBonus: isAscendantGleam
          ? CONSTELLATION_6_DAMAGE_BONUS + CONSTELLATION_6_ASCENDANT_GLEAM_DAMAGE_BONUS
          : CONSTELLATION_6_DAMAGE_BONUS,
      };
    },
    onKitEvent: (event, context, combatant) => {
      const { activeCombatant, kitEffectState, party } = context;
      if (
        combatant.constellationCount >= CONSTELLATION_1 &&
        (event.kind === KitEventKind.SkillUsed || event.kind === KitEventKind.BurstUsed) &&
        event.characterId === combatant.characterId
      ) {
        addKitStatus(kitEffectState, combatant.characterId, {
          id: CONSTELLATION_1_STATUS_ID,
          secondsRemaining: CONSTELLATION_1_SECONDS,
        });
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: CONSTELLATION_1_MASTERY,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: CONSTELLATION_1_SECONDS,
          source: CONSTELLATION_1_STATUS_ID,
        });
      }
      if (event.kind === KitEventKind.CharacterSwapped && event.characterId !== combatant.characterId) {
        // The member coming on the field takes what is left of the buff, which ends when it leaves
        const constellation1Seconds =
          findKitStatus(kitEffectState.effects, combatant.characterId, CONSTELLATION_1_STATUS_ID)?.secondsRemaining ??
          0;
        if (constellation1Seconds > 0)
          buffKitMember(kitEffectState, event.characterId, {
            amount: CONSTELLATION_1_MASTERY,
            attribute: Attribute.ElementalMastery,
            isEndedOnSwap: true,
            secondsRemaining: constellation1Seconds,
            source: CONSTELLATION_1_STATUS_ID,
          });
      }
      if (event.kind !== KitEventKind.DamageTaken) return;
      if (
        combatant.constellationCount >= CONSTELLATION_2 &&
        activeCombatant.characterId !== combatant.characterId &&
        event.striker.characterId === activeCombatant.characterId &&
        kitEffectState.effects.some(
          (effect) => effect.kind === "field" && effect.id === BURST_FIELD_ID && effect.secondsRemaining > 0,
        ) &&
        startKitCooldown(
          kitEffectState,
          combatant.characterId,
          CONSTELLATION_2_COOLDOWN_ID,
          CONSTELLATION_2_COOLDOWN_SECONDS,
        )
      )
        queueKitPassiveHit(context, combatant, constellation2WaterBall, event.enemy);
      if (
        combatant.constellationCount < CONSTELLATION_4 ||
        event.striker.characterId !== combatant.characterId ||
        !skillHits.includes(event.hit) ||
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, CONSTELLATION_4_STATUS_ID)
      )
        return;
      addKitStatus(kitEffectState, combatant.characterId, {
        id: CONSTELLATION_4_STATUS_ID,
        secondsRemaining: CONSTELLATION_4_COOLDOWN_SECONDS,
      });
      gainPartyMemberEnergy(party, combatant, CONSTELLATION_4_ENERGY);
    },
  };
};
