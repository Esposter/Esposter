import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { elementalMasteryMultiplier } from "#src/services/kit/elementalMasteryMultiplier";
import { queueKitPassiveHit } from "#src/services/kit/queueKitPassiveHit";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
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

const hasSeeds = (enemy: Enemy): boolean => enemy.statuses.some(({ id }) => id === SEEDS_OF_SKANDHA_STATUS_ID);

// The count of an element among the deployed team, clamped to two
const countTeamElement = ({ characterIdCombatantMap, party }: KitContext, element: Element): number =>
  Math.min(
    MAX_ELEMENT_COUNT,
    getDeployedCharacterIds(party).filter(
      (characterId) => characterIdCombatantMap.get(characterId)?.element === element,
    ).length,
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
// Ascension 1 and 4, and Constellations 1, 2, 4 and 6, are not built: Illusory Heart's Elemental Mastery buff, Tri-Karma's
// Elemental Mastery bonus, Constellation 1's Shrine tally, Constellation 2's Seeds of Skandha effects, Constellation 4's
// Count of marked enemies, and Constellation 6's Illusory Heart hits
export const createNahidaKitBehaviour = ({
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
  return {
    burst: {
      // The field is cast ahead of the body, and runs from the cast for the burst's start, its seconds and the Hydro
      // Count's extension, its first tick at the frames the record holds, so that its window opens as gcsim's does
      onStart: (context) => {
        const { activeCombatant, body, kitEffectState } = context;
        const { characterId } = activeCombatant;
        const hydroCount = countTeamElement(context, Element.Hydro);
        const extensionSeconds = hydroCount > 0 ? takeOne(hydroExtensions, hydroCount - 1) : 0;
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
    skill: { hits: [markHitBehaviour], onStart: startSkillCast },
    skillHolds: [{ hits: [markHitBehaviour], onStart: startSkillCast }],
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || !hasSeeds(event.enemy)) return;
      const { characterId } = combatant;
      const { kitEffectState } = context;
      if (checkHasKitStatus(kitEffectState.effects, characterId, TRI_KARMA_CLOCK_STATUS_ID)) return;
      const isInWindow = checkHasKitStatus(kitEffectState.effects, characterId, ILLUSORY_HEART_WINDOW_STATUS_ID);
      const electroCount = countTeamElement(context, Element.Electro);
      const pyroCount = countTeamElement(context, Element.Pyro);
      const electroCut = isInWindow && electroCount > 0 ? takeOne(electroCuts, electroCount - 1) : 0;
      addKitStatus(kitEffectState, characterId, {
        id: TRI_KARMA_CLOCK_STATUS_ID,
        secondsRemaining: (TRI_KARMA_INTERVAL_FRAMES - Math.trunc(electroCut * 60)) / 60,
      });
      const damageBonus = isInWindow && pyroCount > 0 ? takeOne(pyroBonuses, pyroCount - 1) : 0;
      for (const enemy of context.enemyMap.values())
        if (hasSeeds(enemy)) queueKitPassiveHit(context, combatant, { ...triKarmaHit, damageBonus }, enemy);
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
  };
};
