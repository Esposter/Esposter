<script setup lang="ts">
import type { OreHit } from "#src/models/gathering/OreHit";
import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PuzzleHit } from "#src/models/puzzle/PuzzleHit";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type {
  CharacterPoser,
  FollowCamera,
  GrassTrail,
  InputState,
  LandmarkCollider,
  Locomotion,
} from "genshin-engine";
import type { Object3D, SkinnedMesh } from "three";

import { Element } from "#src/models/Element";
import { CAMERA_FRAME_PRIORITY, FIXED_STEP_SECONDS } from "#src/services/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { getFollowCameraSettings } from "#src/services/menu/getFollowCameraSettings";
import { getStoredGenshinSettings } from "#src/services/menu/getStoredGenshinSettings";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import {
  IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER,
  PARTY_MEMBER_BURST_INPUT_ACTIONS,
} from "#src/services/party/constants";
import { drownParty } from "#src/services/party/drownParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getImpetuousWindsLocomotion } from "#src/services/party/getImpetuousWindsLocomotion";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { stepPartyElementalStates } from "#src/services/party/stepPartyElementalStates";
import { stepPartyFall } from "#src/services/party/stepPartyFall";
import { WINDRISE_START_POINT } from "#src/services/windrise/constants";
import { useLoop, useTres } from "@tresjs/core";
import { useEventListener } from "@vueuse/core";
import {
  createCharacterController,
  createCharacterPoser,
  createFixedStepLoop,
  createFollowCamera,
  createGroundQuery,
  findSkinnedMesh,
  FOLLOW_CAMERA_PIVOT_SHARE,
  InputAction,
  LocomotionState,
  STAMINA_MAX,
  stepGrassTrail,
} from "genshin-engine";
import { PerspectiveCamera, Vector2, Vector3 } from "three";
import { onBeforeUnmount } from "vue";
import type { PartyHealthChange } from "#src/models/party/PartyHealthChange";

interface Props {
  // What the character is drawn on, which the scene places in the floating origin's group: it is stood at the body's
  // Feet in the world's own coordinates and turned the way the body faces
  body: Object3D;
  // The world's ground at a point in its own coordinates, which the body stands and walks on
  getGroundHeight: (x: number, z: number) => number;
  // The bends the character leaves as it walks through the grass, which it writes each step the body moves
  grassTrail: GrassTrail;
  // The frame's input, which the world screen reads once a frame before the body moves
  inputState: InputState;
  // Whether the body holds where it stands and the follow camera lets go of the view, as a menu or photo mode holds it
  isHeld?: true;
  // Whether a held body still has its camera orbit it, as photo mode's does: the look turns and zooms the view round the
  // Body, which neither steps nor moves
  isOrbiting?: true;
  // The world's combat state the character's kit steps in: the deployed team's party and combatants, whose HP, energy and
  // Cooldowns the kit reads and writes, the enemies it strikes and aims at, and the effects on the team, which outlive a
  // Switch as the field's buffs and infusions do, and are cleared on a drown or a jump, which the screen answers
  kitContext: KitContext;
  landmarkCollider: LandmarkCollider;
  // How the character the body carries moves, its body type's, which a party switch changes
  locomotion: Locomotion;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  // The water's level, below which the body swims
  waterLevel: number;
}

const {
  body,
  getGroundHeight,
  grassTrail,
  inputState,
  isHeld,
  isOrbiting,
  kitContext,
  landmarkCollider,
  locomotion,
  origin,
  waterLevel,
} = defineProps<Props>();
const { party } = kitContext;
// The party went down through a drown, which the world screen answers with the respawn
const emit = defineEmits<{
  clearKitEffects: [];
  drown: [];
  partyHealthChanged: [change: PartyHealthChange];
  reactionTriggered: [enemy: Enemy, reactions: Reaction[]];
  strikeOre: [body: KitBody, hit: OreHit];
  strikePuzzle: [body: KitBody, hit: PuzzleHit];
}>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
// The body moves in the world's own coordinates, read straight off the terrain's height function, so the floating
// Origin moves only what is drawn
const ground = createGroundQuery(getGroundHeight, waterLevel);
// Whether the character on the field has Anemo's resonance, which Impetuous Winds is, read as it is asked
const checkIsImpetuousWinds = (): boolean =>
  kitContext.characterIdCombatantMap.get(getActiveCharacterId(party))?.elementalResonances.includes(Element.Anemo) ??
  false;
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
// The poser of the body's model, which is found again once the model arrives or is taken away, as a pack switch does
let poser: CharacterPoser | undefined;
let posedMesh: SkinnedMesh | undefined;
// The kit of the character on the field, which starts over when a switch brings another on
let kitState = createKitState();
let kitCharacterId: number | undefined;
// The strikes a step lands, emptied once each has struck the enemies in its area
const landedHits: KitHit[] = [];
// Where the character is on the ground and how fast it moves across it, which the grass trail is stamped from
const trailPosition = new Vector2();
const trailVelocity = new Vector2();
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
  stepPartyElementalStates(party, FIXED_STEP_SECONDS);
  trailPosition.set(position.x, position.z);
  trailVelocity
    .set(position.x - characterController.previousPosition.x, position.z - characterController.previousPosition.z)
    .divideScalar(FIXED_STEP_SECONDS);
  stepGrassTrail(grassTrail, trailPosition, trailVelocity, FIXED_STEP_SECONDS);
  stepPartyFall(party, FIXED_STEP_SECONDS);
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
  // A member who is down plays its fall with no presses, so its kit starts nothing while the team's effects still run
  const isFieldStanding = !checkIsCharacterDown(party, characterId);
  stepActiveKit(
    kitState,
    {
      height: position.y - ground.getGround(position.x, position.z).height,
      isAttackHeld: isFieldStanding && inputState.heldActions.has(InputAction.NormalAttack),
      isAttackPressed: isFieldStanding && isAttackPressed,
      isBurstPressed: isFieldStanding && isBurstPressed,
      isSkillHeld: isFieldStanding && inputState.heldActions.has(InputAction.ElementalSkill),
      isSkillPressed: isFieldStanding && isSkillPressed,
      locomotionState: phase.state,
    },
    FIXED_STEP_SECONDS,
    kitContext,
    {
      aimYaw: followCamera?.yaw ?? 0,
      characterController,
      isAimHeld: inputState.heldActions.has(InputAction.Aim),
      landedHits,
      strikeOre: (kitBody, oreHit) => emit("strikeOre", kitBody, oreHit),
      triggerReaction: (enemy, reactions) => emit("reactionTriggered", enemy, reactions),
      triggerHealthChange: (change) => emit("partyHealthChanged", change),
      strikePuzzle: (kitBody, puzzleHit) => emit("strikePuzzle", kitBody, puzzleHit),
    },
  );
});
const pivot = new Vector3();
// Ahead of the floating origin's shift, whatever order it mounts in: the frame's look turns the camera once, the steps
// Move the body, and the body is drawn and the camera follows it at its place between its last two steps, by how far
// The frame has come into the next. A held body stays drawn where it stands, and only an orbit turns its camera
onBeforeRender(({ delta }) => {
  const skinnedMesh = findSkinnedMesh(body);
  if (skinnedMesh !== posedMesh) {
    posedMesh = skinnedMesh;
    poser = skinnedMesh && createCharacterPoser(skinnedMesh);
  }
  // The model is posed from the body's state, whether it moves, stands or is held, before it is drawn
  poser?.update({ delta, locomotion, phase: characterController.phase });
  const activeCamera = camera.value;
  const isFollowing = (!isHeld || isOrbiting) && activeCamera instanceof PerspectiveCamera;
  if (isFollowing) {
    followCamera ??= createFollowCamera({
      camera: activeCamera,
      ground,
      landmarkCollider,
      settings: getFollowCameraSettings(getStoredGenshinSettings()),
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
