import type { StatTables } from "#src/models/character/StatTables";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { InputState } from "genshin-engine";

import { createCharacter } from "#src/services/character/createCharacter";
import { FIXED_STEP_SECONDS, WORLD_RANDOM_SEED } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { createCombatant } from "#src/services/kit/createCombatant";
import { createKitState } from "#src/services/kit/createKitState";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { createParty } from "#src/services/party/createParty";
import { createWorldParty } from "#src/services/party/createWorldParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getElementalResonances } from "#src/services/party/getElementalResonances";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { getCharacterLocomotion } from "#src/services/world/locomotion/getCharacterLocomotion";
import { InvalidOperationError, noop, Operation } from "@esposter/shared";
import {
  createCharacterController,
  createGroundQuery,
  createLandmarkCollider,
  createSeededRandom,
  LocomotionState,
  STAMINA_MAX,
} from "genshin-engine";
import { Vector3 } from "three";
import { describe } from "vitest";

// The fixed steps a span of seconds takes
const toStepCount = (seconds: number): number => Math.round(seconds / FIXED_STEP_SECONDS);

// One minute of the world's fixed step for a team standing at the origin, run as the world runs it: the session's
// Switch, then the character's step, where the body steps, the party's cooldowns run down, a switch starts the kit on
// The field over and that kit steps, in the context the world builds, its combatants built as `useWorldCombat` builds
// Them and its rolls on the world's seeded random source. In combat, three enemies stand in reach and never step, every
// Member starts with its burst charged, and the team plays the minute in turns of seven and a half seconds, the next
// Member switched in at each. A turn presses the skill every step of its first second and a half, held for a tap through
// The minute's first half and for three and a quarter seconds through its second, then presses the burst every step to
// The turn's end, so it plays whenever it is charged, mashes the string from a quarter second after the skill's release
// To 4.75, and presses an attack at 5 and holds it for a second and a half, into a charged attack. Idle, no enemy
// Stands near, nothing is pressed and no one is switched in
export const replayScriptedMinute = ({
  characterIdKitMap,
  enemyTables,
  isInCombat,
  statTables,
}: {
  characterIdKitMap: ReadonlyMap<number, Kit>;
  enemyTables: EnemyTables;
  isInCombat: boolean;
  statTables: StatTables;
}): void => {
  const { characterDataMap } = statTables;
  const characterIds = [...characterIdKitMap.keys()];
  const elementalResonances = getElementalResonances(
    characterIds.flatMap((characterId) => {
      const element = characterDataMap.get(characterId)?.element;
      return element ? [element] : [];
    }),
  );
  const characterIdCombatantMap = new Map(
    Array.from(characterIdKitMap, ([characterId, kit]) => [
      characterId,
      createCombatant(createCharacter(characterId, characterDataMap), kit, elementalResonances, statTables),
    ]),
  );
  const party = createWorldParty(createParty(characterIds));
  if (isInCombat)
    for (const [characterId, { kit }] of characterIdCombatantMap)
      getPartyMember(party, characterId).energy = kit.burstEnergyCost;
  // The enemies in reach stand at level 90, so each outlasts the minute's strikes
  const enemyMap = new Map(
    (isInCombat
      ? [
          { x: 0, z: -1 },
          { x: -1, z: -1.5 },
          { x: 1, z: -1.5 },
        ]
      : []
    ).map((position, index) => {
      const id = String(index);
      return [id, createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id, level: 90, position }, "")];
    }),
  );
  const ground = createGroundQuery(() => 0, -1);
  const characterController = createCharacterController({
    ground,
    landmarkCollider: createLandmarkCollider(),
    position: new Vector3(),
    staminaMaximum: STAMINA_MAX,
  });
  // The body stands still, so the input it steps on holds nothing
  const inputState: InputState = {
    heldActions: new Set(),
    lookPitch: 0,
    lookYaw: 0,
    moveForward: 0,
    moveRight: 0,
    moveUp: 0,
    pressedActions: new Set(),
    zoomSteps: 0,
  };
  const startingCombatant = characterIdCombatantMap.get(getActiveCharacterId(party));
  if (!startingCombatant)
    throw new InvalidOperationError(Operation.Read, replayScriptedMinute.name, `${getActiveCharacterId(party)}`);
  const context: KitContext = {
    activeCombatant: startingCombatant,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    characterIdCombatantMap,
    enemyMap,
    enemyTables,
    expiredEffects: [],
    kitEffectState: { effects: [] },
    locomotionState: LocomotionState.Idle,
    oreStrikes: [],
    outbox: [],
    party,
    placeWildlifeDrops: noop,
    random: createSeededRandom(WORLD_RANDOM_SEED),
    reactionTriggers: [],
    strikes: [],
    wildlifeList: [],
  };
  const landedHits: KitHit[] = [];
  const turnStepCount = toStepCount(7.5);
  // Whether a step at this place in its turn falls in the script's span of seconds, which idle never does
  const checkIsInSpan = (turnStep: number, fromSeconds: number, toSeconds: number): boolean =>
    isInCombat && turnStep >= toStepCount(fromSeconds) && turnStep < toStepCount(toSeconds);
  let kitState = createKitState();
  let kitCharacterId: number | undefined;

  for (let stepIndex = 0; stepIndex < toStepCount(60); stepIndex++) {
    const turnIndex = Math.floor(stepIndex / turnStepCount);
    const turnStep = stepIndex % turnStepCount;
    if (isInCombat && turnStep === 0)
      switchPartyMember(party, turnIndex % characterIds.length, stepIndex * FIXED_STEP_SECONDS);
    const characterId = getActiveCharacterId(party);
    characterController.step(inputState, 0, getCharacterLocomotion(characterId, characterDataMap), FIXED_STEP_SECONDS);
    stepPartyCooldowns(party, FIXED_STEP_SECONDS);
    if (characterId !== kitCharacterId) {
      kitState = createKitState();
      kitCharacterId = characterId;
    }
    const skillHeldSeconds = stepIndex < toStepCount(30) ? 0.1 : 3.25;
    const { phase, position } = characterController;
    stepActiveKit(
      kitState,
      {
        height: position.y - ground.getGround(position.x, position.z).height,
        isAttackHeld: checkIsInSpan(turnStep, 5, 6.5),
        isAttackPressed:
          checkIsInSpan(turnStep, skillHeldSeconds + 0.25, 4.75) || checkIsInSpan(turnStep, 5, 5 + FIXED_STEP_SECONDS),
        isBurstPressed: checkIsInSpan(turnStep, skillHeldSeconds + FIXED_STEP_SECONDS, 7.5),
        isSkillHeld: checkIsInSpan(turnStep, 0, skillHeldSeconds),
        isSkillPressed: checkIsInSpan(turnStep, 0, 1.5),
        locomotionState: phase.state,
      },
      FIXED_STEP_SECONDS,
      context,
      {
        aimYaw: 0,
        characterController,
        isAimHeld: false,
        landedHits,
        strikeOre: noop,
        strikePuzzle: noop,
        triggerReaction: noop,
        triggerHealthChange: noop,
      },
    );
  }
};

describe.todo("replayScriptedMinute");
