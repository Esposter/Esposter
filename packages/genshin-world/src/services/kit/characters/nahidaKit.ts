import type { Enemy } from "#src/models/enemy/Enemy";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { KIT_FRAMES_PER_SECOND } from "#src/services/shared/constants";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

export const NAHIDA_CHARACTER_ID = 10_000_073;

// Seeds of Skandha, the status an enemy carries for the seconds left of it: All Schemes to Know marks each enemy it strikes
// For 25 seconds, and a new mark restarts them, as gcsim's mark does. Tri-Karma Purification strikes the enemies that carry it
export const SEEDS_OF_SKANDHA_STATUS_ID = "nahida-seeds-of-skandha";
const SEEDS_OF_SKANDHA_SECONDS = 25;
// The marks a cast has given, kept as the stacks of a status on Nahida that each cast restarts when it starts. gcsim
// Resets its count at each cast and counts every enemy the cast strikes, marked already or not, up to eight
const SEEDS_OF_SKANDHA_CAST_STATUS_ID = "nahida-seeds-of-skandha-cast";
const SEEDS_OF_SKANDHA_CAST_SECONDS = 6;
const SEEDS_OF_SKANDHA_LIMIT = 8;
// The clock Tri-Karma Purification waits on between strikes, which gcsim sets at 2.5 seconds, less the Electro cut in
// Whole frames, as gcsim takes the cut
const TRI_KARMA_CLOCK_STATUS_ID = "nahida-tri-karma-clock";
const TRI_KARMA_INTERVAL_FRAMES = 150;
// The Dendro particles a Tri-Karma Purification strike gives, once every seven seconds, as gcsim's particle callback does
const TRI_KARMA_PARTICLE_STATUS_ID = "nahida-tri-karma-particle";
const TRI_KARMA_PARTICLE_SECONDS = 7;
const TRI_KARMA_PARTICLE_COUNT = 3;
// Illusory Heart's window: the second an in-field tick opens while Nahida's body stands inside, for Tri-Karma's Pyro bonus
// And Electro cut, as gcsim's withinBurst status does
const ILLUSORY_HEART_WINDOW_STATUS_ID = "nahida-illusory-heart-within";
const ILLUSORY_HEART_WINDOW_SECONDS = 1;
const ILLUSORY_HEART_OFFSET_METRES = 1;
// Each element's count in the team is clamped to two, as gcsim clamps its tallies
const MAX_ELEMENT_COUNT = 2;
// Constellation 1's Shrine tally adds one to each of the Pyro, Hydro and Electro counts before the clamp, as gcsim's c1 does
const CONSTELLATION_1 = 1;
const CONSTELLATION_2 = 2;
// Constellation 2's DEF reduction on a marked enemy for eight seconds from a Quicken, Aggravate or Spread on it, and its CRIT
// On a Lunar-Bloom hit of another member's that lands on a marked enemy, as gcsim (MIT) nahida/cons.go gives them
const CONSTELLATION_2_DEFENCE_REACTION_TYPES: ReadonlySet<ReactionType> = new Set([
  ReactionType.Aggravate,
  ReactionType.Quicken,
  ReactionType.Spread,
]);
const CONSTELLATION_2_DEFENCE_STATUS_ID = "nahida-c2-defence-reduction";
const CONSTELLATION_2_DEFENCE_REDUCTION = 0.3;
const CONSTELLATION_2_DEFENCE_SECONDS = 8;
const CONSTELLATION_2_LUNAR_BLOOM_CRITICAL_RATE_BONUS = 0.1;
const CONSTELLATION_2_LUNAR_BLOOM_CRITICAL_DAMAGE_BONUS = 0.2;
// Constellation 4's Elemental Mastery, from the marked enemies within 30 metres of her, as gcsim's c4 gives it: 80, and 20 more
// For each enemy, up to four
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_AREA: AttackArea = { angle: Math.PI * 2, height: 2, radius: 30 };
const CONSTELLATION_4_MARKED_STATUS_ID = "nahida-c4-marked-count";
const CONSTELLATION_4_MAX_ENEMIES = 4;
const CONSTELLATION_4_BASE_ELEMENTAL_MASTERY = 80;
const CONSTELLATION_4_ELEMENTAL_MASTERY_PER_ENEMY = 20;
// Constellation 6's Karmic Oblivion, which each normal or charged attack's hit on a marked enemy queues on every marked enemy
// Once Illusory Heart is unleashed: 200% of her ATK and 400% of her Elemental Mastery, at most six times in ten seconds, and
// Once in 0.2 seconds, as gcsim's c6 gives them
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_STATUS_ID = "nahida-c6-karmic-oblivion";
const CONSTELLATION_6_SECONDS = 10;
const CONSTELLATION_6_MAX_INSTANCES = 6;
const CONSTELLATION_6_CLOCK_STATUS_ID = "nahida-c6-karmic-oblivion-clock";
const CONSTELLATION_6_CLOCK_SECONDS = 0.2;
const CONSTELLATION_6_ATK_MULTIPLIER = 2;
const CONSTELLATION_6_ELEMENTAL_MASTERY_MULTIPLIER = 4;

const checkHasSeeds = (enemy: Enemy): boolean => enemy.statuses.some(({ id }) => id === SEEDS_OF_SKANDHA_STATUS_ID);

// Queues a hit of Nahida's on each enemy that carries her marks, as Tri-Karma Purification and Karmic Oblivion both strike them
const queueSeedsHit = (context: KitContext, combatant: Combatant, hit: KitHit): void => {
  for (const enemy of context.enemyMap.values())
    if (checkHasSeeds(enemy)) queueKitPassiveHit(context, combatant, hit, enemy);
};

// The count of an element among the deployed team, clamped to two, with Constellation 1's Shrine tally on top
const countTeamElement = (
  { characterIdCombatantMap, party }: KitContext,
  { constellationCount }: Combatant,
  element: Element,
): number =>
  Math.min(
    MAX_ELEMENT_COUNT,
    getDeployedCharacterIds(party).filter(
      (characterId) => characterIdCombatantMap.get(characterId)?.element === element,
    ).length + (constellationCount >= CONSTELLATION_1 ? 1 : 0),
  );

// Starts a cast of All Schemes to Know, restarting the count of the marks it gives
const startSkillCast = ({ activeCombatant, kitEffectState }: KitContext) =>
  addKitStatus(kitEffectState, activeCombatant.characterId, {
    id: SEEDS_OF_SKANDHA_CAST_STATUS_ID,
    secondsRemaining: SEEDS_OF_SKANDHA_CAST_SECONDS,
    stacks: 0,
  });

// Marks an enemy a press or a full hold strikes while the cast has marks left to give, each strike counting, marked or not
const markEnemy = ({ kitEffectState }: KitContext, { combatant }: KitStrike, enemy?: Enemy): void => {
  const cast = findKitStatus(kitEffectState.effects, combatant.characterId, SEEDS_OF_SKANDHA_CAST_STATUS_ID);
  if (!enemy || !cast || (cast.stacks ?? 0) >= SEEDS_OF_SKANDHA_LIMIT) return;
  cast.stacks = (cast.stacks ?? 0) + 1;
  addEnemyStatus(enemy, {
    damageTakenBonus: 0,
    id: SEEDS_OF_SKANDHA_STATUS_ID,
    secondsRemaining: SEEDS_OF_SKANDHA_SECONDS,
  });
};

const markHitBehaviour: KitHitBehaviour = { onStrike: markEnemy };

// Nahida's behaviour: All Schemes to Know's press and full hold mark the enemies they strike with Seeds of Skandha, up to
// Eight a cast. A reaction on a marked enemy sets off Tri-Karma Purification, which strikes every marked enemy on the
// Kit clock, and Illusory Heart's field, whose ticks open its window for the Pyro bonus and the Electro cut
// Ascension 1 and 4 are not built: Illusory Heart's Elemental Mastery buff and Tri-Karma's Elemental Mastery bonus. Constellation
// 2's CRIT on the reactions of a marked enemy is not built either: its CRIT Rate and CRIT DMG are fixed at 20% and 100%, where
// The kit's hooks only add to a striker's, so a reaction's CRIT would be an approximation
export const createNahidaKitBehaviour = ({
  kit,
  readArea,
  readHit,
  readParameter,
  readParameters,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const illusoryHeartRadius = readArea("illusoryHeart").radius;
  const illusoryHeartSeconds = readParameter("illusoryHeartSeconds");
  const illusoryHeartStartSeconds = readSeconds("illusoryHeartStart");
  const illusoryHeartFirstTickSeconds = readSeconds("illusoryHeartFirstTick");
  const illusoryHeartTickSeconds = readSeconds("illusoryHeartTickInterval");
  const hydroExtensions = readParameters("illusoryHeartHydroExtension");
  const electroCuts = readParameters("triKarmaElectroIntervalCut");
  const pyroBonuses = readParameters("triKarmaPyroDamageBonus");
  const elementalMasteryShare = readParameter("triKarmaElementalMastery");
  const triKarmaHit = readHit("triKarmaPurification", {
    additiveBaseDamageBonus: (striker) => elementalMasteryMultiplier(striker, elementalMasteryShare),
  });
  // Karmic Oblivion strikes as Tri-Karma does, with its own multipliers, and is dealt as Elemental Skill DMG
  const karmicOblivionHit: KitHit = {
    ...triKarmaHit,
    additiveBaseDamageBonus: (striker) =>
      elementalMasteryMultiplier(striker, CONSTELLATION_6_ELEMENTAL_MASTERY_MULTIPLIER),
    attackTag: AttackTag.ElementalSkill,
    talentMultiplier: CONSTELLATION_6_ATK_MULTIPLIER,
  };
  // A normal or charged attack's hit on a marked enemy triggers Karmic Oblivion while Illusory Heart's unleashed status holds
  const karmicOblivionHitBehaviour: KitHitBehaviour = {
    onStrike: (context, { combatant }, enemy) => {
      const { kitEffectState } = context;
      const { characterId } = combatant;
      const karmicOblivion = findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_6_STATUS_ID);
      if (
        !karmicOblivion ||
        !checkHasSeeds(enemy) ||
        (karmicOblivion.stacks ?? 0) >= CONSTELLATION_6_MAX_INSTANCES ||
        checkHasKitStatus(kitEffectState.effects, characterId, CONSTELLATION_6_CLOCK_STATUS_ID)
      )
        return;
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_6_CLOCK_STATUS_ID,
        secondsRemaining: CONSTELLATION_6_CLOCK_SECONDS,
      });
      karmicOblivion.stacks = (karmicOblivion.stacks ?? 0) + 1;
      queueSeedsHit(context, combatant, karmicOblivionHit);
    },
  };
  return {
    burst: {
      // The field is cast ahead of the body, and runs from the cast for the burst's start, its seconds and the Hydro
      // Count's extension, its first tick at the frames the record holds, so that its window opens as gcsim's does
      onStart: (context) => {
        const { activeCombatant, body, kitEffectState } = context;
        const { characterId } = activeCombatant;
        const hydroCount = countTeamElement(context, activeCombatant, Element.Hydro);
        const extensionSeconds = hydroCount > 0 ? takeOne(hydroExtensions, hydroCount - 1) : 0;
        // Unleashing Illusory Heart starts Karmic Oblivion's ten seconds, its instances counted from zero, as gcsim's c6 does
        if (activeCombatant.constellationCount >= CONSTELLATION_6)
          addKitStatus(kitEffectState, characterId, {
            id: CONSTELLATION_6_STATUS_ID,
            secondsRemaining: CONSTELLATION_6_SECONDS,
            stacks: 0,
          });
        castKitField(kitEffectState, characterId, createAheadBody(body, ILLUSORY_HEART_OFFSET_METRES).position, {
          nextTickSeconds: illusoryHeartFirstTickSeconds,
          onTick: (tickContext) =>
            addKitStatus(tickContext.kitEffectState, characterId, {
              id: ILLUSORY_HEART_WINDOW_STATUS_ID,
              secondsRemaining: ILLUSORY_HEART_WINDOW_SECONDS,
            }),
          radius: illusoryHeartRadius,
          secondsRemaining: illusoryHeartStartSeconds + illusoryHeartSeconds + extensionSeconds,
          tickIntervalSeconds: illusoryHeartTickSeconds,
        });
      },
    },
    chargedAttack: { hits: kit.chargedAttack.hits.map(() => karmicOblivionHitBehaviour) },
    getPartyStrikeBonus: (member, { hit }, enemy) => {
      const isLunarBloomStrike = hit.lunarHit?.lunarReactionType === LunarReactionType.LunarBloom;
      const isBonusedStrike =
        member.constellationCount >= CONSTELLATION_2 && isLunarBloomStrike && checkHasSeeds(enemy);
      return {
        criticalDamageBonus: isBonusedStrike ? CONSTELLATION_2_LUNAR_BLOOM_CRITICAL_DAMAGE_BONUS : 0,
        criticalRateBonus: isBonusedStrike ? CONSTELLATION_2_LUNAR_BLOOM_CRITICAL_RATE_BONUS : 0,
      };
    },
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => {
      const markedCount = findKitStatus(effects, characterId, CONSTELLATION_4_MARKED_STATUS_ID)?.stacks ?? 0;
      const count = Math.min(markedCount, CONSTELLATION_4_MAX_ENEMIES);
      return [
        {
          amount:
            count === 0
              ? 0
              : CONSTELLATION_4_BASE_ELEMENTAL_MASTERY + count * CONSTELLATION_4_ELEMENTAL_MASTERY_PER_ENEMY,
          attribute: Attribute.ElementalMastery,
        },
      ];
    },
    normalAttacks: kit.normalAttacks.map(({ hits }) => ({ hits: hits.map(() => karmicOblivionHitBehaviour) })),
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || !checkHasSeeds(event.enemy)) return;
      const { characterId } = combatant;
      const { kitEffectState } = context;
      const isDefenceReaction = event.reactions.some(({ reactionType }) =>
        CONSTELLATION_2_DEFENCE_REACTION_TYPES.has(reactionType),
      );
      if (combatant.constellationCount >= CONSTELLATION_2 && isDefenceReaction)
        addEnemyStatus(event.enemy, {
          damageTakenBonus: 0,
          defenseReduction: CONSTELLATION_2_DEFENCE_REDUCTION,
          id: CONSTELLATION_2_DEFENCE_STATUS_ID,
          secondsRemaining: CONSTELLATION_2_DEFENCE_SECONDS,
        });
      if (checkHasKitStatus(kitEffectState.effects, characterId, TRI_KARMA_CLOCK_STATUS_ID)) return;
      const isInWindow = checkHasKitStatus(kitEffectState.effects, characterId, ILLUSORY_HEART_WINDOW_STATUS_ID);
      const electroCount = countTeamElement(context, combatant, Element.Electro);
      const pyroCount = countTeamElement(context, combatant, Element.Pyro);
      const electroCut = isInWindow && electroCount > 0 ? takeOne(electroCuts, electroCount - 1) : 0;
      addKitStatus(kitEffectState, characterId, {
        id: TRI_KARMA_CLOCK_STATUS_ID,
        secondsRemaining: toKitSeconds(TRI_KARMA_INTERVAL_FRAMES - Math.trunc(electroCut * KIT_FRAMES_PER_SECOND)),
      });
      const damageBonus = isInWindow && pyroCount > 0 ? takeOne(pyroBonuses, pyroCount - 1) : 0;
      queueSeedsHit(context, combatant, { ...triKarmaHit, damageBonus });
      if (!checkHasKitStatus(kitEffectState.effects, characterId, TRI_KARMA_PARTICLE_STATUS_ID)) {
        addKitStatus(kitEffectState, characterId, {
          id: TRI_KARMA_PARTICLE_STATUS_ID,
          secondsRemaining: TRI_KARMA_PARTICLE_SECONDS,
        });
        collectKitEnergyDrops(
          [{ count: TRI_KARMA_PARTICLE_COUNT, element: Element.Dendro, energyDropKind: EnergyDropKind.Particle }],
          undefined,
          context,
        );
      }
    },
    // Constellation 4 counts the marked enemies within 30 metres of her each step, as gcsim's c4 reads them as her stat is priced
    onStep: ({ body, enemyMap, kitEffectState }, { characterId, constellationCount }) => {
      if (constellationCount < CONSTELLATION_4) return;
      const markedCount = [...enemyMap.values()].filter(
        (enemy) => checkHasSeeds(enemy) && checkIsInAttackArea(CONSTELLATION_4_AREA, body, enemy),
      ).length;
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_4_MARKED_STATUS_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: markedCount,
      });
    },
    skill: { hits: [markHitBehaviour], onStart: startSkillCast },
    skillHolds: [{ hits: [markHitBehaviour], onStart: startSkillCast }],
  };
};
