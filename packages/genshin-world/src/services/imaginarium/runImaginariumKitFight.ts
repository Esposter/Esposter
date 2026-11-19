import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { ImaginariumKitFight } from "#src/models/imaginarium/ImaginariumKitFight";
import type { ActiveKitControls } from "#src/models/kit/ActiveKitControls";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";

import { EnemyEvent } from "#src/models/enemy/EnemyEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { FIXED_STEP_SECONDS, WORLD_RANDOM_SEED } from "#src/services/constants";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { createKitBody } from "#src/services/kit/createKitBody";
import { createKitState } from "#src/services/kit/createKitState";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { createParty } from "#src/services/party/createParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { MILLISECONDS_PER_SECOND, takeOne } from "@esposter/shared";
import {
  createCharacterController,
  createGroundQuery,
  createLandmarkCollider,
  createSeededRandom,
  createStamina,
  LocomotionState,
  STAMINA_MAX,
} from "genshin-engine";
import { Vector3 } from "three";

// The fixed steps between the field performer's attack presses and between its skill presses: half a second and a
// Second at the world's step, so each press follows the last action's end
const ATTACK_PRESS_STEPS = 30;
const SKILL_PRESS_STEPS = 60;

const noop = (): void => undefined;

// A stage's fight, played on the world's fixed step by the performers' kits and the enemies, through the same steps the
// World's frame runs them with. The performer on the field attacks, casts its skill on a cadence and bursts once its
// Energy is full, and a performer who falls hands the field to the next one standing. Each enemy steps toward the body
// And strikes the team as it would in the world. The fight ends once every enemy is defeated, the team has fallen or
// The time limit passes
export const runImaginariumKitFight = (
  performers: readonly Combatant[],
  enemies: readonly Enemy[],
  enemyTables: EnemyTables,
  timeLimitMilliseconds: number,
): ImaginariumKitFight => {
  const party = createParty(performers.map(({ characterId }) => characterId));
  const characterIdCombatantMap = new Map(performers.map((combatant) => [combatant.characterId, combatant]));
  const kitStates = new Map(performers.map(({ characterId }) => [characterId, createKitState()]));
  // Each performer starts the stage at full health and energy, its energy at its Burst's cost
  for (const { characterId, kit } of performers) {
    const partyMember = getPartyMember(party, characterId);
    partyMember.energy = kit.burstEnergyCost;
    partyMember.healthShare = 1;
  }
  const controller = createCharacterController({
    ground: createGroundQuery(() => 0, -1),
    landmarkCollider: createLandmarkCollider(),
    position: new Vector3(),
    stamina: createStamina(STAMINA_MAX),
  });
  const landedHits: KitHit[] = [];
  const controls: ActiveKitControls = {
    aimYaw: 0,
    characterController: controller,
    isAimHeld: false,
    landedHits,
    strikeOre: noop,
    strikePuzzle: noop,
    triggerHealthChange: noop,
    triggerReaction: noop,
  };
  const context: KitContext = {
    activeCombatant: takeOne(performers),
    body: createKitBody({ x: 0, z: 0 }),
    characterIdCombatantMap,
    enemyMap: new Map(enemies.map((enemy) => [getSpawnKey(enemy.campId, enemy.id), enemy])),
    enemyTables,
    expiredEffects: [],
    isSkillHeld: false,
    kitEffectState: { effects: [] },
    locomotionState: LocomotionState.Idle,
    oreStrikes: [],
    outbox: [],
    party,
    placeWildlifeDrops: noop,
    random: createSeededRandom(WORLD_RANDOM_SEED),
    reactionTriggers: [],
    stamina: controller.stamina,
    strikes: [],
    wildlifeList: [],
    worldEffects: [],
  };
  const timeLimitSeconds = timeLimitMilliseconds / MILLISECONDS_PER_SECOND;
  const countDefeats = (): number => enemies.filter(({ state }) => state === EnemyState.Dead).length;
  let elapsedSeconds = 0;
  let stepCount = 0;
  while (elapsedSeconds < timeLimitSeconds && countDefeats() < enemies.length && !checkIsPartyDown(party)) {
    const characterId = getActiveCharacterId(party);
    const combatant = characterIdCombatantMap.get(characterId);
    const kitState = kitStates.get(characterId);
    if (combatant && kitState) {
      const input: KitInput = {
        height: 0,
        isAttackHeld: false,
        isAttackPressed: stepCount % ATTACK_PRESS_STEPS === 0,
        isBurstPressed: getPartyMember(party, characterId).energy >= combatant.kit.burstEnergyCost,
        isSkillHeld: false,
        isSkillPressed: stepCount % SKILL_PRESS_STEPS === 0,
        locomotionState: LocomotionState.Idle,
      };
      stepActiveKit(kitState, input, FIXED_STEP_SECONDS, context, controls);
    }
    const target = { x: controller.position.x, z: controller.position.z };
    for (const enemy of enemies)
      if (stepEnemy(enemy, target, FIXED_STEP_SECONDS) === EnemyEvent.Strike)
        context.outbox.push(
          ...strikePartyMember(
            enemyTables,
            party,
            enemy,
            context.activeCombatant,
            context.kitEffectState,
            characterIdCombatantMap,
          ),
        );
    // A performer who falls hands the field to the next one standing, so the team fights on while any of it stands
    const standingIndex = getDeployedCharacterIds(party).findIndex((id) => !checkIsCharacterDown(party, id));
    if (checkIsCharacterDown(party, characterId) && standingIndex !== -1)
      switchPartyMember(party, standingIndex, FIXED_STEP_SECONDS, context.kitEffectState.effects);
    elapsedSeconds += FIXED_STEP_SECONDS;
    stepCount += 1;
  }
  return {
    defeats: countDefeats(),
    elapsedMilliseconds: elapsedSeconds * MILLISECONDS_PER_SECOND,
    isPartyDown: checkIsPartyDown(party),
  };
};
