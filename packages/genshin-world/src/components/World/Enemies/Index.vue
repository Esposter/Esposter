<script setup lang="ts">
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { RegionData } from "#src/models/world/RegionData";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { EnemyEvent } from "#src/models/enemy/EnemyEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { computeEnemyDrops } from "#src/services/enemy/computeEnemyDrops";
import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";
import {
  ENEMY_CAPACITY,
  ENEMY_CAPSULE_HEIGHT,
  ENEMY_CAPSULE_RADIUS,
  ENEMY_DEATH_SECONDS,
  ENEMY_STEP_SECONDS,
  ENEMY_TARGET_CAMERA_HEIGHT,
} from "#src/services/enemy/constants";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { EnemyStateColorMap } from "#src/services/enemy/EnemyStateColorMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { wakeEnemyCamps } from "#src/services/enemy/wakeEnemyCamps";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { ID_SEPARATOR } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import { createFixedStepLoop, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry, Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";

interface Props {
  // Whether a screen over the world holds it, as the game's menus pause its enemies
  isHeld?: true;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  rampTexture: DataTexture;
  regionDataMap: ReadonlyMap<string, RegionData>;
}

const { isHeld, lightUniforms, origin, rampTexture, regionDataMap } = defineProps<Props>();
// A strike for combat to land on the active character, and a defeated enemy's drops for the bag and the party
const emit = defineEmits<{ defeat: [enemy: Enemy, enemyDrops: EnemyDrops]; strike: [enemy: Enemy] }>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const getSpawnKey = (campId: string, memberId: string) => `${campId}${ID_SEPARATOR}${memberId}`;
// When each spawn was last defeated, kept for the page's life until a saved game keeps it
const spawnKeyDefeatedAtMap = new Map<string, Temporal.ZonedDateTime>();
const loadedCampIds = new Set<string>();
let enemies: Enemy[] = [];
// A camp spawns as its region's data arrives, each member whose respawn time has come, and is dropped as it leaves,
// So an enemy comes back only on a load, never in view
watchImmediate(
  () => [...regionDataMap.values()].flatMap(({ enemyCamps }) => enemyCamps),
  (enemyCamps) => {
    const campIds = new Set(enemyCamps.map(({ id }) => id));
    enemies = enemies.filter(({ campId }) => campIds.has(campId));
    for (const campId of loadedCampIds.difference(campIds)) loadedCampIds.delete(campId);
    const now = Temporal.Now.zonedDateTimeISO();
    for (const { id, members } of enemyCamps) {
      if (loadedCampIds.has(id)) continue;
      loadedCampIds.add(id);
      const campEnemyTypes = members.map(({ enemyKindId }) => getEnemyKind(enemyKindId).enemyType);
      for (const member of members) {
        const spawnKey = getSpawnKey(id, member.id);
        const defeatedAt = spawnKeyDefeatedAtMap.get(spawnKey);
        if (defeatedAt && Temporal.ZonedDateTime.compare(computeEnemyRespawnTime(campEnemyTypes, defeatedAt), now) > 0)
          continue;
        spawnKeyDefeatedAtMap.delete(spawnKey);
        enemies.push(createEnemy(member, id));
      }
    }
  },
);
// While no character stands in the world, the point under the camera is the target, while the camera flies low
const target = { x: 0, z: 0 };
let isTargeted = false;
const fixedStepLoop = createFixedStepLoop(ENEMY_STEP_SECONDS, () => {
  let isAnyDefeated = false;
  for (const enemy of enemies) {
    const enemyEvent = stepEnemy(enemy, isTargeted ? target : undefined, ENEMY_STEP_SECONDS);
    if (enemyEvent === EnemyEvent.Strike) emit("strike", enemy);
    else if (enemyEvent === EnemyEvent.Defeated) {
      isAnyDefeated = true;
      spawnKeyDefeatedAtMap.set(getSpawnKey(enemy.campId, enemy.id), Temporal.Now.zonedDateTimeISO());
      emit(
        "defeat",
        enemy,
        computeEnemyDrops(getEnemyKind(enemy.enemyKindId), enemy.level, () => Math.random()),
      );
    }
  }

  if (isAnyDefeated)
    enemies = enemies.filter(
      ({ state, stateSeconds }) => !(state === EnemyState.Dead && stateSeconds >= ENEMY_DEATH_SECONDS),
    );
  wakeEnemyCamps(enemies);
});
// Every enemy is one capsule of one instanced draw, stood on the ground, turned to its heading and tinted by its state
const enemyMesh = new InstancedMesh(
  new CapsuleGeometry(ENEMY_CAPSULE_RADIUS, ENEMY_CAPSULE_HEIGHT - ENEMY_CAPSULE_RADIUS * 2),
  createToonMaterial({ color: "#ffffff", lightUniforms, rampTexture }),
  ENEMY_CAPACITY,
);
enemyMesh.castShadow = true;
// The capsules move, so the mesh's bounds, measured once, would cull them where they once stood
enemyMesh.frustumCulled = false;
const color = new Color();
const matrix = new Matrix4();
const point = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3(1, 1, 1);
const up = new Vector3(0, 1, 0);
// The tint is written for every instance up front, so the material is built reading it
for (let index = 0; index < ENEMY_CAPACITY; index += 1) enemyMesh.setColorAt(index, color);

onBeforeRender(({ delta }) => {
  const activeCamera = camera.value;
  if (activeCamera) {
    target.x = activeCamera.position.x + origin.x;
    target.z = activeCamera.position.z + origin.z;
    isTargeted = activeCamera.position.y - getWorldHeight(target.x, target.z) <= ENEMY_TARGET_CAMERA_HEIGHT;
  }

  if (!isHeld) fixedStepLoop.advance(delta);
  enemyMesh.count = Math.min(enemies.length, ENEMY_CAPACITY);
  for (const [index, { heading, position, state }] of enemies.entries()) {
    if (index === ENEMY_CAPACITY) break;
    point.set(position.x, getWorldHeight(position.x, position.z) + ENEMY_CAPSULE_HEIGHT / 2, position.z);
    enemyMesh.setMatrixAt(index, matrix.compose(point, rotation.setFromAxisAngle(up, heading), scale));
    enemyMesh.setColorAt(index, color.setHex(EnemyStateColorMap[state]));
  }
  enemyMesh.instanceMatrix.needsUpdate = true;
  if (enemyMesh.instanceColor) enemyMesh.instanceColor.needsUpdate = true;
});

onUnmounted(() => {
  enemyMesh.geometry.dispose();
  enemyMesh.material.dispose();
  enemyMesh.dispose();
});
</script>

<template>
  <primitive :object="enemyMesh" />
</template>
