<script setup lang="ts">
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { FollowCamera, InputState, LandmarkCollider, Locomotion } from "genshin-engine";
import type { Object3D } from "three";

import water from "#src/data/windrise/water.json";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { CAMERA_FRAME_PRIORITY, FIXED_STEP_SECONDS } from "#src/services/constants";
import { readOreHits } from "#src/services/gathering/readOreHits";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { createKitState } from "#src/services/kit/createKitState";
import { coordinateKitSummons } from "#src/services/kit/effects/coordinateKitSummons";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { infuseKitHits } from "#src/services/kit/effects/infuseKitHits";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { selectAttackTarget } from "#src/services/kit/selectAttackTarget";
import { stepKit } from "#src/services/kit/stepKit";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import {
  IMPETUOUS_WINDS_STAMINA_CONSUMPTION_MULTIPLIER,
  PARTY_MEMBER_BURST_INPUT_ACTIONS,
} from "#src/services/party/constants";
import { drownParty } from "#src/services/party/drownParty";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getImpetuousWindsLocomotion } from "#src/services/party/getImpetuousWindsLocomotion";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { WINDRISE_START_POINT } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
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
}

const {
  body,
  characterIdCombatantMap,
  enemyMap,
  enemyTables,
  inputState,
  isHeld,
  isOrbiting,
  kitEffectState,
  landmarkCollider,
  locomotion,
  origin,
  party,
  random,
} = defineProps<Props>();
// The party went down through a drown, which the world screen answers with the respawn
const emit = defineEmits<{ clearKitEffects: []; drown: []; strikeOre: [body: KitBody, hit: OreHit] }>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
// The body moves in the world's own coordinates, read straight off the terrain's height function, so the floating
// Origin moves only what is drawn
const ground = createGroundQuery((x, z) => getWorldHeight(x, z), water.level);
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
  // A character whose talent multipliers have not arrived has no combatant yet, so it walks and does not fight
  const combatant = characterIdCombatantMap.get(characterId);
  if (!combatant) return;
  const height = position.y - ground.getGround(position.x, position.z).height;
  const kitInput: KitInput = {
    height,
    isAttackHeld: inputState.heldActions.has(InputAction.NormalAttack),
    isAttackPressed,
    isBurstPressed,
    isSkillHeld: inputState.heldActions.has(InputAction.ElementalSkill),
    isSkillPressed,
    locomotionState: phase.state,
  };
  const kitBody: KitBody = { facing: characterController.facing, height, position };
  const summonStrikes = stepKitEffects(kitEffectState, FIXED_STEP_SECONDS, {
    activeCombatant: combatant,
    body: kitBody.position,
    party,
  });
  const infusion = getKitInfusion(kitEffectState.effects, characterId);
  const landedStart = landedHits.length;
  const action = stepKit(
    kitState,
    combatant.kit,
    kitInput,
    getPartyMember(party, characterId),
    characterController.stamina,
    FIXED_STEP_SECONDS,
    landedHits,
    { body: kitBody, combatant, kitEffectState },
  );
  // The ores are struck by the hits as the kit gives them, before an infusion copies them
  const landedOreHits = landedHits.length > landedStart ? readOreHits(combatant, landedHits.slice(landedStart)) : [];
  if (infusion !== undefined) infuseKitHits(combatant.kit, infusion, landedHits, landedStart);
  // A started action turns the body to the enemy it targets, and the hits that follow are drawn from the turned body. An
  // Aimed shot instead turns it to the camera's aim while the aim is held, as the bow's aim binding is
  if (action?.isAimed && inputState.heldActions.has(InputAction.Aim)) {
    characterController.face(followCamera?.yaw ?? 0);
    kitBody.facing = characterController.facing;
  } else if (action) {
    const target = selectAttackTarget(action.targetingArea, kitBody, enemyMap.values());
    if (target) {
      const dx = target.position.x - position.x;
      const dz = target.position.z - position.z;
      characterController.face(Math.atan2(-dx, -dz));
      kitBody.facing = characterController.facing;
    }
  }

  action?.onStart?.({ body: kitBody, combatant, kitEffectState });
  if (action) coordinateKitSummons(action, { body: kitBody, combatant, kitEffectState });
  for (const oreHit of landedOreHits) emit("strikeOre", kitBody, oreHit);
  // The summons' hits land from their own bodies, priced by the combatants that cast them, and the step's own hits from
  // The turned body and the character on the field
  const strikes: KitStrike[] = [
    ...summonStrikes,
    ...landedHits.map((hit): KitStrike => ({ body: kitBody, combatant, hit })),
  ];
  landedHits.length = 0;
  for (const { body: strikeBody, combatant: strikeCombatant, hit, target } of strikes) {
    const pricedCombatant = getBuffedCombatant(strikeCombatant, kitEffectState.effects);
    // A hit's party heal rolls on each enemy it strikes until one roll passes
    let isPartyHealed = false;
    for (const enemy of enemyMap.values()) {
      if (
        [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
        (target ? target !== enemy : !checkIsInAttackArea(hit.hitArea, strikeBody, enemy))
      )
        continue;
      addEnduringRockStatus(enemy, pricedCombatant, kitEffectState.effects);
      const { energyDrops, reactions } = strikeEnemy(enemyTables, enemy, hit, pricedCombatant, random);
      for (const energyDrop of energyDrops)
        gainPartyEnergy(party, energyDrop, strikeCombatant.element, characterIdCombatantMap);
      addSprawlingGreeneryBuffs(kitEffectState, party, pricedCombatant, reactions);
      strikeKitBubble(kitEffectState, enemy, pricedCombatant, hit);
      healKitStriker(party, pricedCombatant, hit);
      hit.onStrike?.({ body: strikeBody, combatant: strikeCombatant, kitEffectState });
      if (!isPartyHealed)
        isPartyHealed = healKitParty(
          party,
          characterIdCombatantMap,
          kitEffectState.effects,
          pricedCombatant,
          hit,
          random,
        );
    }
  }
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
    characterController.place(placedPosition.set(point.x, getWorldHeight(point.x, point.z), point.z), yaw);
    kitState = createKitState();
    emit("clearKitEffects");
    followCamera?.reset(yaw);
  },
  stamina: characterController.stamina,
});
</script>

<template />
