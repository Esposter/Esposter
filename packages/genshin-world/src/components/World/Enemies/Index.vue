<script setup lang="ts">
import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitTaunt } from "#src/models/kit/KitTaunt";
import type { RegionData } from "#src/models/world/RegionData";
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture, Scene } from "three";

import { EnemyEvent } from "#src/models/enemy/EnemyEvent";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";
import { computeEnemySightColor } from "#src/services/elementalSight/computeEnemySightColor";
import { createSightProxy } from "#src/services/elementalSight/createSightProxy";
import { computeEnemyDrops } from "#src/services/enemy/computeEnemyDrops";
import { computeEnemyRespawnTime } from "#src/services/enemy/computeEnemyRespawnTime";
import {
  ENEMY_CAPACITY,
  ENEMY_CAPSULE_HEIGHT,
  ENEMY_CAPSULE_RADIUS,
  ENEMY_DEATH_SECONDS,
  ENEMY_HIT_FLASH_RADIUS,
  ENEMY_HIT_FLASH_SECONDS,
  ENEMY_HIT_TINT_SECONDS,
  ENEMY_STEP_SECONDS,
  HIT_TINT_COLOR,
} from "#src/services/enemy/constants";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { EnemyStateColorMap } from "#src/services/enemy/EnemyStateColorMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { stepEnemy } from "#src/services/enemy/stepEnemy";
import { wakeEnemyCamps } from "#src/services/enemy/wakeEnemyCamps";
import { selectEnemyTaunt } from "#src/services/kit/selectEnemyTaunt";
import { composeHeadingMatrix } from "#src/services/world/composeHeadingMatrix";
import { useLoop } from "@tresjs/core";
import { watchImmediate } from "@vueuse/core";
import { createFixedStepLoop, createInstancedMesh, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry, Color, Matrix4, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";

interface Props {
  // The enemies in the world by their spawn key, which this writes as the camps load and unload and as enemies die
  enemyMap: Map<string, Enemy>;
  // The game's enemy tables, which each spawn's kind, stats and drops are read from
  enemyTables: EnemyTables;
  // The world's ground at a point in its own coordinates, which each enemy stands on
  getGroundHeight: (x: number, z: number) => number;
  // Whether a screen over the world holds it, as the game's menus pause its enemies
  isHeld?: true;
  // The effects on the team, whose live taunts draw the enemies' strikes within their aggro range
  kitEffectState: KitEffectState;
  // The last teleport, which brings back a boss whose blossom is unclaimed, none until the player has teleported
  lastTeleportAt?: Temporal.ZonedDateTime;
  lightUniforms: LightUniforms;
  // The camps of the ley line outcrops whose fights run: each spawns whole as its fight starts, and is dropped as it is won
  outcropCamps?: EnemyCamp[];
  rampTexture: DataTexture;
  regionDataMap: ReadonlyMap<string, RegionData>;
  // The scene the sight's mask is drawn from, which each enemy's stand-in is added to, lit in its element's colour
  sightScene: Scene;
  // The point the enemies target, the character's feet, which none is given while no character stands in the world
  target?: GroundPoint;
  // Each defeated boss's Trounce Blossom where it fell, which holds the boss until it is claimed or a teleport comes
  trounceBlossoms: ReadonlyMap<string, TrounceBlossom>;
  // The World Level the camps spawn at, which a change of it spawns every camp anew at
  worldLevel: number;
  // The game's world level table, which a camp's level under a World Level is read from
  worldLevelRows: readonly WorldLevelRow[];
}

const {
  enemyMap,
  enemyTables,
  getGroundHeight,
  isHeld,
  kitEffectState,
  lastTeleportAt,
  lightUniforms,
  outcropCamps = [],
  rampTexture,
  regionDataMap,
  sightScene,
  target,
  trounceBlossoms,
  worldLevel,
  worldLevelRows,
} = defineProps<Props>();
// A strike for combat to land on the active character, and a defeated enemy's drops for the bag and the party
const emit = defineEmits<{
  campCleared: [camp: ClearedCamp];
  defeat: [enemy: Enemy, enemyDrops: EnemyDrops];
  // A boss comes back at its spawn, so the blossom it left is gone
  respawn: [spawnKey: string];
  strike: [enemy: Enemy, taunt: KitTaunt | undefined];
}>();
const { onBeforeRender } = useLoop();
// When each spawn was last defeated, kept for the page's life until a saved game keeps it
const spawnKeyDefeatedAtMap = new Map<string, Temporal.ZonedDateTime>();
const loadedCampIds = new Set<string>();
// A camp spawns as its region's data arrives, each member whose respawn time has come, and is dropped as it leaves,
// So an enemy comes back only on a load, never in view
let spawnedWorldLevel = worldLevel;
watchImmediate(
  () => [worldLevel, [...regionDataMap.values()].flatMap(({ enemyCamps }) => enemyCamps), outcropCamps] as const,
  ([currentWorldLevel, enemyCamps, fightingCamps]) => {
    if (currentWorldLevel !== spawnedWorldLevel) {
      spawnedWorldLevel = currentWorldLevel;
      enemyMap.clear();
      loadedCampIds.clear();
    }
    const campIds = new Set([...enemyCamps, ...fightingCamps].map(({ id }) => id));
    for (const [spawnKey, { campId }] of enemyMap) if (!campIds.has(campId)) enemyMap.delete(spawnKey);
    for (const campId of loadedCampIds.difference(campIds)) loadedCampIds.delete(campId);
    const now = Temporal.Now.zonedDateTimeISO();
    for (const { id, members } of enemyCamps) {
      if (loadedCampIds.has(id)) continue;
      loadedCampIds.add(id);
      const campEnemyTypes = members.map(
        ({ enemyKindId }) => getEnemyKind(enemyTables.enemyKindMap, enemyKindId).enemyType,
      );
      for (const member of members) {
        const spawnKey = getSpawnKey(id, member.id);
        const defeatedAt = spawnKeyDefeatedAtMap.get(spawnKey);
        if (defeatedAt) {
          const respawnAt = computeEnemyRespawnTime(
            campEnemyTypes,
            defeatedAt,
            trounceBlossoms.get(spawnKey),
            lastTeleportAt,
          );
          if (!respawnAt || Temporal.ZonedDateTime.compare(respawnAt, now) > 0) continue;
        }
        spawnKeyDefeatedAtMap.delete(spawnKey);
        if (trounceBlossoms.has(spawnKey)) emit("respawn", spawnKey);
        enemyMap.set(spawnKey, createEnemy(enemyTables, worldLevelRows, member, id, currentWorldLevel));
      }
    }
    // An outcrop's camp spawns whole as its fight starts, so no member's respawn time applies to it
    for (const { id, members } of fightingCamps) {
      if (loadedCampIds.has(id)) continue;
      loadedCampIds.add(id);
      for (const member of members) {
        const spawnKey = getSpawnKey(id, member.id);
        spawnKeyDefeatedAtMap.delete(spawnKey);
        enemyMap.set(spawnKey, createEnemy(enemyTables, worldLevelRows, member, id, currentWorldLevel));
      }
    }
  },
);
const fixedStepLoop = createFixedStepLoop(ENEMY_STEP_SECONDS, () => {
  let isAnyDefeated = false;
  for (const enemy of enemyMap.values()) {
    // The reactions its elements bring on their own as they age wait on it for the kit on the field to price
    advanceElementalState(enemy.elementalState, ENEMY_STEP_SECONDS, enemy.elementalReactions);
    const taunt = selectEnemyTaunt(enemy, kitEffectState.effects);
    const enemyEvent = stepEnemy(enemy, taunt ? taunt.body.position : target, ENEMY_STEP_SECONDS);
    if (enemyEvent === EnemyEvent.Strike) emit("strike", enemy, taunt);
    else if (enemyEvent === EnemyEvent.Defeated) {
      isAnyDefeated = true;
      const enemyKind = getEnemyKind(enemyTables.enemyKindMap, enemy.enemyKindId);
      const spawnKey = getSpawnKey(enemy.campId, enemy.id);
      spawnKeyDefeatedAtMap.set(spawnKey, Temporal.Now.zonedDateTimeISO());
      emit(
        "defeat",
        enemy,
        computeEnemyDrops(enemyKind, enemy.level, () => Math.random()),
      );
      // A camp is cleared once every one of its members is defeated, which this defeat completes when they all are down
      const camp = [...regionDataMap.values()]
        .flatMap(({ enemyCamps }) => enemyCamps)
        .find(({ id }) => id === enemy.campId);
      const [firstMember] = camp?.members ?? [];
      if (camp && firstMember && camp.members.every(({ id }) => spawnKeyDefeatedAtMap.has(getSpawnKey(camp.id, id))))
        emit("campCleared", { id: camp.id, position: firstMember.position });
    }
  }

  if (isAnyDefeated)
    for (const [spawnKey, { state, stateSeconds }] of enemyMap)
      if (state === EnemyState.Dead && stateSeconds >= ENEMY_DEATH_SECONDS) enemyMap.delete(spawnKey);
  wakeEnemyCamps([...enemyMap.values()]);
});
// Every enemy is one capsule of one instanced draw, stood on the ground, turned to its heading and tinted by its state,
// And one that was hit in the last moments is tinted by the hit, with a small flash drawn at its middle
const enemyMesh = createInstancedMesh(
  new CapsuleGeometry(ENEMY_CAPSULE_RADIUS, ENEMY_CAPSULE_HEIGHT - ENEMY_CAPSULE_RADIUS * 2),
  createToonMaterial({ color: "#ffffff", lightUniforms, rampTexture }),
  ENEMY_CAPACITY,
);
enemyMesh.castShadow = true;
// The capsules move, so the mesh's bounds, measured once, would cull them where they once stood
enemyMesh.frustumCulled = false;
const hitFlashMesh = createInstancedMesh(
  new SphereGeometry(ENEMY_HIT_FLASH_RADIUS),
  new MeshBasicMaterial({ color: HIT_TINT_COLOR }),
  ENEMY_CAPACITY,
);
hitFlashMesh.frustumCulled = false;
// The sight's stand-in of the capsules, drawn from the same matrices and lit in each enemy's colour under the sight
const sightProxy = createSightProxy(enemyMesh);
sightScene.add(sightProxy);
const color = new Color();
const sightColor = new Color();
const matrix = new Matrix4();
const point = new Vector3();
// The tint is written for every instance up front, so the material is built reading it
for (let index = 0; index < ENEMY_CAPACITY; index += 1) {
  enemyMesh.setColorAt(index, color);
  sightProxy.setColorAt(index, sightColor);
}

onBeforeRender(({ delta }) => {
  if (!isHeld) fixedStepLoop.advance(delta);
  let count = 0;
  let flashCount = 0;
  for (const { elementalState, enemyKindId, heading, hitSeconds, position, state } of enemyMap.values()) {
    if (count === ENEMY_CAPACITY) break;
    point.set(position.x, getGroundHeight(position.x, position.z) + ENEMY_CAPSULE_HEIGHT / 2, position.z);
    enemyMesh.setMatrixAt(count, composeHeadingMatrix(matrix, point, heading));
    enemyMesh.setColorAt(
      count,
      color.setHex(hitSeconds < ENEMY_HIT_TINT_SECONDS ? HIT_TINT_COLOR : EnemyStateColorMap[state]),
    );
    sightProxy.setColorAt(count, sightColor.set(computeEnemySightColor(elementalState, enemyKindId)));
    if (hitSeconds < ENEMY_HIT_FLASH_SECONDS) {
      hitFlashMesh.setMatrixAt(flashCount, matrix.makeTranslation(point.x, point.y, point.z));
      flashCount += 1;
    }
    count += 1;
  }
  enemyMesh.count = count;
  sightProxy.count = count;
  hitFlashMesh.count = flashCount;
  enemyMesh.instanceMatrix.needsUpdate = true;
  if (enemyMesh.instanceColor) enemyMesh.instanceColor.needsUpdate = true;
  if (sightProxy.instanceColor) sightProxy.instanceColor.needsUpdate = true;
  hitFlashMesh.instanceMatrix.needsUpdate = true;
});

onUnmounted(() => {
  sightScene.remove(sightProxy);
  sightProxy.material.dispose();
  sightProxy.dispose();
  enemyMesh.geometry.dispose();
  enemyMesh.material.dispose();
  enemyMesh.dispose();
  hitFlashMesh.geometry.dispose();
  hitFlashMesh.material.dispose();
  hitFlashMesh.dispose();
});
</script>

<template>
  <primitive :object="enemyMesh" />
  <primitive :object="hitFlashMesh" />
</template>
