<script setup lang="ts">
import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
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

import { useEnemyCampLocks } from "#src/composables/useEnemyCampLocks";
import { useEnemySimulation } from "#src/composables/useEnemySimulation";
import { useEnemySpawns } from "#src/composables/useEnemySpawns";
import { computeEnemySightColor } from "#src/services/elementalSight/computeEnemySightColor";
import { createSightProxy } from "#src/services/elementalSight/createSightProxy";
import {
  ENEMY_CAPACITY,
  ENEMY_CAPSULE_HEIGHT,
  ENEMY_CAPSULE_RADIUS,
  ENEMY_HIT_FLASH_RADIUS,
  ENEMY_HIT_FLASH_SECONDS,
  ENEMY_HIT_TINT_SECONDS,
  HIT_TINT_COLOR,
} from "#src/services/enemy/constants";
import { EnemyStateColorMap } from "#src/services/enemy/EnemyStateColorMap";
import { composeHeadingMatrix } from "#src/services/world/composeHeadingMatrix";
import { useLoop } from "@tresjs/core";
import { createInstancedMesh, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry, Color, Matrix4, MeshBasicMaterial, SphereGeometry, Vector3 } from "three";

interface Props {
  // The moments the defeated bosses fell, by their spawn keys, as the save holds them: each boss stays down from its
  // Defeat until its blossom is claimed or a teleport out of its area comes after it
  bossDefeatMap: ReadonlyMap<string, string>;
  // The enemies in the world by their spawn key, which this writes as the camps load and unload and as enemies die
  enemyMap: Map<string, Enemy>;
  // The moments the defeated enemies come back, by their spawn keys, for the camps with no boss among them
  // As the save holds them
  enemyRespawnMap: ReadonlyMap<string, string>;
  // The game's enemy tables, which each spawn's kind, stats and drops are read from
  enemyTables: EnemyTables;
  // The world's ground at a point in its own coordinates, which each enemy stands on
  getGroundHeight: (x: number, z: number) => number;
  // The world's clock, the server's where it is known, against which each defeat, load and jump is read
  getWorldNow: () => Temporal.Instant;
  // Whether a screen over the world holds it, as the game's menus pause its enemies
  isHeld: boolean;
  // Whether something covers the world, which then draws no frames, so its enemies stand still as well
  isPaused: boolean;
  // The effects on the team, whose live taunts draw the enemies' strikes within their aggro range
  kitEffectState: KitEffectState;
  // The last teleport into each area, by the area's id and the one outside every area under the empty id, which holds a
  // Boss down until a teleport lands outside its area after its defeat
  lastTeleportAts: ReadonlyMap<string, Temporal.Instant>;
  lightUniforms: LightUniforms;
  // The camps of the ley line outcrops whose fights run: each spawns whole as its fight starts, and is dropped as it is won
  outcropCamps: EnemyCamp[];
  rampTexture: DataTexture;
  regionDataMap: ReadonlyMap<string, RegionData>;
  // The scene the sight's mask is drawn from, which each enemy's stand-in is added to, lit in its element's colour
  sightScene: Scene;
  // The point the enemies target, the character's feet, which none is given while no character stands in the world
  target?: GroundPoint;
  // Each defeated boss's Trounce Blossom where it fell, which holds the boss until it is claimed or a teleport out of its
  // Area comes
  trounceBlossoms: ReadonlyMap<string, TrounceBlossom>;
  // The World Level the camps spawn at, which a change of it spawns every camp anew at
  worldLevel: number;
  // The game's world level table, which a camp's level under a World Level is read from
  worldLevelRows: readonly WorldLevelRow[];
}

const {
  bossDefeatMap,
  enemyMap,
  enemyRespawnMap,
  enemyTables,
  getGroundHeight,
  getWorldNow,
  isHeld,
  isPaused,
  kitEffectState,
  lastTeleportAts,
  lightUniforms,
  outcropCamps,
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
  // Each camp as a lock on the chests within its reach, done once every member is dead or not spawned
  campLocks: [locks: ChestLockSource[]];
  defeat: [enemy: Enemy, enemyDrops: EnemyDrops];
  // The party entering combat once an enemy is aggravated on it, and leaving it once none has been for the grace period
  enterCombat: [];
  leaveCombat: [];
  // A boss comes back at its spawn, so its defeat and the blossom it left are gone
  respawn: [spawnKey: string];
  // A defeated boss's moment of defeat, which the save keeps until the boss comes back
  saveBossDefeat: [spawnKey: string, defeatedAt: string];
  // A defeated member of a camp with no boss comes back at this instant, which the save keeps
  saveRespawn: [spawnKey: string, respawnAt: string];
  // An enemy whose shield a hit broke, once for each time it breaks, which a boss's fight counts as its shield breaks
  shieldBreak: [enemy: Enemy];
  strike: [enemy: Enemy, taunt: KitTaunt | undefined];
}>();
const { onBeforeRender } = useLoop();
const campLocks = useEnemyCampLocks((locks) => emit("campLocks", locks));
const { getCampEnemyTypes, getEnemyCamps, spawnKeyDefeatedAtMap } = useEnemySpawns({
  bossDefeatMap,
  enemyMap,
  enemyRespawnMap: () => enemyRespawnMap,
  enemyTables: () => enemyTables,
  getWorldNow,
  lastTeleportAts: () => lastTeleportAts,
  onLoad: campLocks.reset,
  onRespawn: (spawnKey) => emit("respawn", spawnKey),
  outcropCamps: () => outcropCamps,
  regionDataMap: () => regionDataMap,
  trounceBlossoms: () => trounceBlossoms,
  worldLevel: () => worldLevel,
  worldLevelRows: () => worldLevelRows,
});
const fixedStepLoop = useEnemySimulation({
  campLocks,
  enemyMap,
  enemyTables: () => enemyTables,
  getCampEnemyTypes,
  getEnemyCamps,
  getWorldNow,
  kitEffectState: () => kitEffectState,
  onCampCleared: (camp) => emit("campCleared", camp),
  onDefeat: (enemy, enemyDrops) => emit("defeat", enemy, enemyDrops),
  onEnterCombat: () => emit("enterCombat"),
  onLeaveCombat: () => emit("leaveCombat"),
  onSaveBossDefeat: (spawnKey, defeatedAt) => emit("saveBossDefeat", spawnKey, defeatedAt),
  onSaveRespawn: (spawnKey, respawnAt) => emit("saveRespawn", spawnKey, respawnAt),
  onShieldBreak: (enemy) => emit("shieldBreak", enemy),
  onStrike: (enemy, taunt) => emit("strike", enemy, taunt),
  spawnKeyDefeatedAtMap,
  target: () => target,
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
  if (!isHeld && !isPaused) fixedStepLoop.advance(delta);
  let count = 0;
  let flashCount = 0;
  for (const { elementalState, heading, hitSeconds, position, state, traits } of enemyMap.values()) {
    if (count === ENEMY_CAPACITY) break;
    point.set(position.x, getGroundHeight(position.x, position.z) + ENEMY_CAPSULE_HEIGHT / 2, position.z);
    enemyMesh.setMatrixAt(count, composeHeadingMatrix(matrix, point, heading));
    enemyMesh.setColorAt(
      count,
      color.setHex(hitSeconds < ENEMY_HIT_TINT_SECONDS ? HIT_TINT_COLOR : EnemyStateColorMap[state]),
    );
    sightProxy.setColorAt(count, sightColor.set(computeEnemySightColor(elementalState, traits.element)));
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
