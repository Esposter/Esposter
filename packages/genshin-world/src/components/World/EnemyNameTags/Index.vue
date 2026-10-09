<script setup lang="ts">
import type { Enemy } from "#src/models/enemy/Enemy";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { SightNameTag } from "#src/models/sight/SightNameTag";
import type { Camera } from "three";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { checkIsInSightReach } from "#src/services/elementalSight/checkIsInSightReach";
import { ENEMY_CAPSULE_HEIGHT } from "#src/services/enemy/constants";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { useRafFn } from "@vueuse/core";
import { Vector3 } from "three";

interface Props {
  elementalSight: ElementalSight;
  // The enemies in the world by their spawn key, whose names the sight shows once they lie within its reach
  enemyMap: Map<string, Enemy>;
  // The camera the world is drawn through, none until the canvas has one
  getCamera: () => Camera | undefined;
  // The game's names by text id in the reader's language, which an enemy's name is read from once they arrive
  nameText?: Readonly<Record<string, string>>;
  // The world coordinate the scene's origin stands on, taken off each enemy's place before it is projected through the camera
  origin: Vector3;
}

const { elementalSight, enemyMap, getCamera, nameText, origin } = defineProps<Props>();
const nameTags = shallowRef<SightNameTag[]>([]);
const point = new Vector3();
// Each living enemy within the sight's reach that has a name is projected through the camera where it stands, its head
// Lifted by its capsule, and the tags are handed on only when there are some or there were, so a sight that is off re-renders nothing
useRafFn(() => {
  const camera = getCamera();
  if (!camera || !elementalSight.isOn) {
    if (nameTags.value.length > 0) nameTags.value = [];
    return;
  }
  nameTags.value = [...enemyMap].flatMap(([key, { enemyKindId, position, state }]) => {
    const name = nameText?.[String(getEnemyKind(enemyKindId).nameTextId)] ?? "";
    if (state === EnemyState.Dead || !name || !checkIsInSightReach(elementalSight, position)) return [];
    point
      .set(position.x - origin.x, getWorldHeight(position.x, position.z) + ENEMY_CAPSULE_HEIGHT, position.z - origin.z)
      .project(camera);
    if (Math.abs(point.z) > 1) return [];
    return [{ key, left: ((point.x + 1) / 2) * 100, name, top: ((1 - point.y) / 2) * 100 }];
  });
});
</script>

<template>
  <div class="sight-name-tags">
    <div
      v-for="{ key, left, name, top } in nameTags"
      :key
      class="sight-name-tag"
      :style="{ left: `${left}%`, top: `${top}%` }"
    >
      {{ name }}
    </div>
  </div>
</template>

<style scoped>
/* The tags float over the world, so they never take a press the world would have had */
.sight-name-tags {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Provisional: the tag's type size and its lift above the enemy's head, until a recording of the sight measures them */
.sight-name-tag {
  position: absolute;
  transform: translate(-50%, -100%);
  color: #fff;
  font-size: 0.875rem;
  text-shadow: 0 0 0.25rem #000;
  white-space: nowrap;
}
</style>
