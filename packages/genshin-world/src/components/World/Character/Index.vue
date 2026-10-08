<script setup lang="ts">
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { Party } from "#src/models/party/Party";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { FollowCamera, InputState, LandmarkCollider, Locomotion } from "genshin-engine";
import type { Object3D } from "three";

import water from "#src/data/windrise/water.json";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { CAMERA_FRAME_PRIORITY, FIXED_STEP_SECONDS } from "#src/services/constants";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { createKitState } from "#src/services/kit/createKitState";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { drownParty } from "#src/services/party/drownParty";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { WINDRISE_START_POINT } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { useEventListener } from "@vueuse/core";
import {
  createCharacterController,
  createFixedStepLoop,
  createFollowCamera,
  createGroundQuery,
  FOLLOW_CAMERA_PIVOT_HEIGHT,
  InputAction,
  LocomotionState,
  STAMINA_MAX,
} from "genshin-engine";
import { PerspectiveCamera, Vector3 } from "three";

interface Props {
  // What the character is drawn on, which the scene places in the floating origin's group: it is stood at the body's
  // Feet in the world's own coordinates and turned the way the body faces
  body: Object3D;
  // Each character of the deployed team's combat, by its id, which the kit on the field is priced and struck by
  characterIdCombatantMap: Map<number, Combatant>;
  // The enemies in the world by their spawn key, which the kit on the field strikes and aims at
  enemyMap: Map<string, Enemy>;
  // The frame's input, which the world screen reads once a frame before the body moves
  inputState: InputState;
  // Whether the body holds where it stands and the follow camera lets go of the view, as a menu or photo mode holds it
  isHeld?: true;
  landmarkCollider: LandmarkCollider;
  // How the character the body carries moves, its body type's, which a party switch changes
  locomotion: Locomotion;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  // The deployed team, whose members' HP, energy and cooldowns the character's kit reads and writes
  party: Party;
}

const { body, characterIdCombatantMap, enemyMap, inputState, isHeld, landmarkCollider, locomotion, origin, party } =
  defineProps<Props>();
// The party went down through a drown, which the world screen answers with the respawn
const emit = defineEmits<{ drown: [] }>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
// The body moves in the world's own coordinates, read straight off the terrain's height function, so the floating
// Origin moves only what is drawn
const ground = createGroundQuery((x, z) => getWorldHeight(x, z), water.level);
const characterController = createCharacterController({
  ground,
  landmarkCollider,
  position: new Vector3(
    WINDRISE_START_POINT.x,
    getWorldHeight(WINDRISE_START_POINT.x, WINDRISE_START_POINT.z),
    WINDRISE_START_POINT.z,
  ),
  staminaMaximum: STAMINA_MAX,
});
let followCamera: FollowCamera | undefined;
// The kit of the character on the field, which starts over when a switch brings another on
let kitState = createKitState();
let kitCharacterId: number | undefined;
// The strikes a step lands, emptied once each has struck the enemies in its area
const landedHits: KitHit[] = [];
// The input an action plays under: the same presses with no move, so the body holds still while it plays
const stillInput: InputState = { ...inputState, moveForward: 0, moveRight: 0 };
const fixedStepLoop = createFixedStepLoop(FIXED_STEP_SECONDS, () => {
  // The controller's step spends the frame's presses, so the kit reads them first
  const { heldPresses, phase, position } = characterController;
  const previousState = phase.state;
  const isAttackPressed = heldPresses.has(InputAction.NormalAttack);
  const isBurstPressed = heldPresses.has(InputAction.ElementalBurst);
  const isSkillPressed = heldPresses.has(InputAction.ElementalSkill);
  characterController.step(
    kitState.action ? stillInput : inputState,
    followCamera?.yaw ?? 0,
    locomotion,
    FIXED_STEP_SECONDS,
  );
  stepPartyCooldowns(party, FIXED_STEP_SECONDS);
  if (phase.state === LocomotionState.Drown && previousState !== LocomotionState.Drown) {
    drownParty(party);
    emit("drown");
  }

  const characterId = getActiveCharacterId(party);
  if (characterId !== kitCharacterId) {
    kitState = createKitState();
    kitCharacterId = characterId;
  }
  const combatant = characterIdCombatantMap.get(characterId);
  if (!combatant) throw new InvalidOperationError(Operation.Read, "combatant", `character ${characterId}`);
  const height = position.y - ground.getGround(position.x, position.z).height;
  const kitInput: KitInput = {
    height,
    isAttackHeld: inputState.heldActions.has(InputAction.NormalAttack),
    isAttackPressed,
    isBurstPressed,
    isSkillPressed,
    locomotionState: phase.state,
  };
  const action = stepKit(
    kitState,
    combatant.kit,
    kitInput,
    getPartyMember(party, characterId),
    characterController.stamina,
    FIXED_STEP_SECONDS,
    landedHits,
  );
  const kitBody: KitBody = { facing: characterController.facing, height, position };
  if (action) {
    // A started action turns the body to the enemy it targets, and the hits that follow are drawn from the turned body
    const target = selectAttackTarget(action.targetingArea, kitBody, enemyMap.values());
    if (target) {
      const dx = target.position.x - position.x;
      const dz = target.position.z - position.z;
      characterController.face(Math.atan2(-dx, -dz));
      kitBody.facing = characterController.facing;
    }
  }

  for (const hit of landedHits)
    for (const enemy of enemyMap.values()) {
      if (
        [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
        !checkIsInAttackArea(hit.hitArea, kitBody, enemy)
      )
        continue;
      for (const energyDrop of strikeEnemy(enemy, hit, combatant, Math.random))
        gainPartyEnergy(party, energyDrop, combatant.element, characterIdCombatantMap);
    }
  landedHits.length = 0;
});
const pivot = new Vector3();
// Ahead of the floating origin's shift, whatever order it mounts in: the frame's look turns the camera once, the steps
// Move the body, and the body is drawn and the camera follows it at its place between its last two steps, by how far
// The frame has come into the next. A held body stays drawn where it stands
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  const isFollowing = !isHeld && activeCamera instanceof PerspectiveCamera;
  if (isFollowing) {
    followCamera ??= createFollowCamera({ camera: activeCamera, ground, landmarkCollider });
    characterController.holdPresses(inputState);
    followCamera.look(inputState, characterController.facing);
    fixedStepLoop.advance(delta);
  }

  body.position.lerpVectors(
    characterController.previousPosition,
    characterController.position,
    fixedStepLoop.getStepShare(),
  );
  body.rotation.set(0, characterController.facing, 0);
  if (!isFollowing) return;
  pivot.copy(body.position);
  pivot.y += FOLLOW_CAMERA_PIVOT_HEIGHT;
  followCamera?.follow(pivot, origin, delta);
}, CAMERA_FRAME_PRIORITY);
// A click on the canvas takes the pointer, which the look reads while it is locked
useEventListener(renderer.domElement, "click", () => renderer.domElement.requestPointerLock());
const placedPosition = new Vector3();
// A jump stands the body on the ground at its pose's point, facing the pose's yaw, with the camera level behind it. A
// Jump ends an action in progress. The party's stamina is read by the HUD's meter
defineExpose({
  place: ({ point, yaw }: WorldJumpPose) => {
    characterController.place(placedPosition.set(point.x, getWorldHeight(point.x, point.z), point.z), yaw);
    kitState = createKitState();
    followCamera?.reset(yaw);
  },
  stamina: characterController.stamina,
});
</script>

<template />
