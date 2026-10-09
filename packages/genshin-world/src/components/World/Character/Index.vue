<script setup lang="ts">
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { Party } from "#src/models/party/Party";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { FollowCamera, InputState, LandmarkCollider, Locomotion } from "genshin-engine";
import type { Object3D } from "three";

import { Element } from "#src/models/Element";
import { CAMERA_FRAME_PRIORITY, FIXED_STEP_SECONDS } from "#src/services/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import {
  IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER,
  PARTY_MEMBER_BURST_INPUT_ACTIONS,
} from "#src/services/party/constants";
import { drownParty } from "#src/services/party/drownParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getImpetuousWindsLocomotion } from "#src/services/party/getImpetuousWindsLocomotion";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { WINDRISE_START_POINT } from "#src/services/windrise/constants";
import { useLoop, useTres } from "@tresjs/core";
import { useEventListener } from "@vueuse/core";
import {
  createCharacterController,
  createFixedStepLoop,
  createFollowCamera,
  createGroundQuery,
  FOLLOW_CAMERA_DEFAULT_SETTINGS,
  FOLLOW_CAMERA_PIVOT_SHARE,
  InputAction,
  LocomotionState,
  STAMINA_MAX,
} from "genshin-engine";
import { PerspectiveCamera, Vector3 } from "three";
import { onBeforeUnmount } from "vue";

interface Props {
  // What the character is drawn on, which the scene places in the floating origin's group: it is stood at the body's
  // Feet in the world's own coordinates and turned the way the body faces
  body: Object3D;
  // Each character of the deployed team's combat, by its id, which the kit on the field is priced and struck by
  characterIdCombatantMap: Map<number, Combatant>;
  // The enemies in the world by their spawn key, which the kit on the field strikes and aims at
  enemyMap: Map<string, Enemy>;
  // The game's enemy tables, which each strike on an enemy reads its defence and resistances from
  enemyTables: EnemyTables;
  // The world's ground at a point in its own coordinates, which the body stands and walks on
  getGroundHeight: (x: number, z: number) => number;
  // The frame's input, which the world screen reads once a frame before the body moves
  inputState: InputState;
  // Whether the body holds where it stands and the follow camera lets go of the view, as a menu or photo mode holds it
  isHeld?: true;
  // Whether a held body still has its camera orbit it, as photo mode's does: the look turns and zooms the view round the
  // Body, which neither steps nor moves
  isOrbiting?: true;
  // The effects on the deployed team, which outlive a switch as the field's buffs and infusions do, and are cleared on a
  // Drown or a jump, which the screen answers by clearing them
  kitEffectState: KitEffectState;
  landmarkCollider: LandmarkCollider;
  // How the character the body carries moves, its body type's, which a party switch changes
  locomotion: Locomotion;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  // The deployed team, whose members' HP, energy and cooldowns the character's kit reads and writes
  party: Party;
  // The world's one seeded random source, which the strikes' CRIT rolls and the kit's own rolls draw on, so a session's
  // Rolls repeat
  random: () => number;
  // The water's level, below which the body swims
  waterLevel: number;
}

const {
  body,
  characterIdCombatantMap,
  enemyMap,
  enemyTables,
  getGroundHeight,
  inputState,
  isHeld,
  isOrbiting,
  kitEffectState,
  landmarkCollider,
  locomotion,
  origin,
  party,
  random,
  waterLevel,
} = defineProps<Props>();
// The party went down through a drown, which the world screen answers with the respawn
const emit = defineEmits<{ clearKitEffects: []; drown: []; strikeOre: [body: KitBody, hit: OreHit] }>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
// The body moves in the world's own coordinates, read straight off the terrain's height function, so the floating
// Origin moves only what is drawn
const ground = createGroundQuery(getGroundHeight, waterLevel);
// Whether the character on the field has Anemo's resonance, which Impetuous Winds is, read as it is asked
const checkIsImpetuousWinds = (): boolean =>
  characterIdCombatantMap.get(getActiveCharacterId(party))?.elementalResonances.includes(Element.Anemo) ?? false;
const characterController = createCharacterController({
  // Impetuous Winds cuts every stamina spend, the kit's and the body's, read from the same resonance as its speeds
  getStaminaConsumptionMultiplier: () => (checkIsImpetuousWinds() ? IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER : 1),
  ground,
  landmarkCollider,
  position: new Vector3(
    WINDRISE_START_POINT.x,
    getGroundHeight(WINDRISE_START_POINT.x, WINDRISE_START_POINT.z),
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
  // A switch with a burst uses the burst once its member is on the field, the world screen having switched to it this
  // Frame, so a refused switch uses none
  const burstSwitchIndex = PARTY_MEMBER_BURST_INPUT_ACTIONS.findIndex((action) => heldPresses.has(action));
  const isBurstPressed =
    heldPresses.has(InputAction.ElementalBurst) || (burstSwitchIndex !== -1 && burstSwitchIndex === party.activeIndex);
  const isSkillPressed = heldPresses.has(InputAction.ElementalSkill);
  // Impetuous Winds raises the speeds the controller moves the body by, read from the character on the field before the
  // Controller steps
  characterController.step(
    kitState.action ? stillInput : inputState,
    followCamera?.yaw ?? 0,
    checkIsImpetuousWinds() ? getImpetuousWindsLocomotion(locomotion) : locomotion,
    FIXED_STEP_SECONDS,
  );
  stepPartyCooldowns(party, FIXED_STEP_SECONDS);
  if (phase.state === LocomotionState.Drown && previousState !== LocomotionState.Drown) {
    drownParty(party);
    emit("clearKitEffects");
    emit("drown");
  }

  const characterId = getActiveCharacterId(party);
  if (characterId !== kitCharacterId) {
    kitState = createKitState();
    kitCharacterId = characterId;
  }
  stepActiveKit(
    kitState,
    {
      height: position.y - ground.getGround(position.x, position.z).height,
      isAttackHeld: inputState.heldActions.has(InputAction.NormalAttack),
      isAttackPressed,
      isBurstPressed,
      isSkillHeld: inputState.heldActions.has(InputAction.ElementalSkill),
      isSkillPressed,
      locomotionState: phase.state,
    },
    FIXED_STEP_SECONDS,
    {
      aimYaw: followCamera?.yaw ?? 0,
      characterController,
      characterIdCombatantMap,
      enemyMap,
      enemyTables,
      isAimHeld: inputState.heldActions.has(InputAction.Aim),
      kitEffectState,
      landedHits,
      party,
      random,
      strikeOre: (kitBody, oreHit) => emit("strikeOre", kitBody, oreHit),
    },
  );
});
const pivot = new Vector3();
// Ahead of the floating origin's shift, whatever order it mounts in: the frame's look turns the camera once, the steps
// Move the body, and the body is drawn and the camera follows it at its place between its last two steps, by how far
// The frame has come into the next. A held body stays drawn where it stands, and only an orbit turns its camera
onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  const isFollowing = (!isHeld || isOrbiting) && activeCamera instanceof PerspectiveCamera;
  if (isFollowing) {
    followCamera ??= createFollowCamera({
      camera: activeCamera,
      ground,
      landmarkCollider,
      settings: FOLLOW_CAMERA_DEFAULT_SETTINGS,
    });
    followCamera.look(inputState, characterController.facing);
    if (!isHeld) {
      characterController.holdPresses(inputState);
      fixedStepLoop.advance(delta);
    }
  }

  body.position.lerpVectors(
    characterController.previousPosition,
    characterController.position,
    fixedStepLoop.getStepShare(),
  );
  body.rotation.set(0, characterController.facing, 0);
  if (!isFollowing) return;
  pivot.copy(body.position);
  pivot.y += locomotion.capsuleHeight * FOLLOW_CAMERA_PIVOT_SHARE;
  followCamera?.follow(pivot, origin, delta);
}, CAMERA_FRAME_PRIORITY);
// The effects are the screen's, and they stop with the character that steps them, so none outlives its unmount
onBeforeUnmount(() => {
  emit("clearKitEffects");
});
// A click on the canvas takes the pointer, which the look reads while it is locked
useEventListener(renderer.domElement, "click", () => renderer.domElement.requestPointerLock());
const placedPosition = new Vector3();
// A jump stands the body on the ground at its pose's point, facing the pose's yaw, with the camera level behind it. A
// Jump ends an action in progress. The party's stamina is read by the HUD's meter
defineExpose({
  place: ({ point, yaw }: WorldJumpPose) => {
    characterController.place(placedPosition.set(point.x, getGroundHeight(point.x, point.z), point.z), yaw);
    kitState = createKitState();
    emit("clearKitEffects");
    followCamera?.reset(yaw);
  },
  stamina: characterController.stamina,
});
</script>

<template />
