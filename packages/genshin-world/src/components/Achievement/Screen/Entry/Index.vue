<script setup lang="ts">
import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";

interface Props {
  achievement: Achievement;
  // The progress of the achievements by their ids, which the row reads its count and whether it is finished from
  progressMap: ReadonlyMap<number, AchievementProgress>;
  // The achievements' and categories' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { achievement, progressMap, textMap } = defineProps<Props>();
const isFinished = computed(() => checkIsAchievementFinished(achievement.id, progressMap));
// A hidden achievement shows nothing of itself until it is finished
const isRevealed = computed(() => !achievement.isHidden || isFinished.value);
</script>

<template>
  <li class="achievement">
    <span class="medal" />
    <div class="text">
      <p class="title">{{ isRevealed ? textMap[achievement.titleTextId] : "?" }}</p>
      <p v-if="isRevealed" class="description">{{ textMap[achievement.descriptionTextId] }}</p>
    </div>
    <span class="reward">
      <span class="primogems">{{ achievement.primogems }}</span>
    </span>
    <span class="progress">
      <span v-if="isFinished" class="stamp" />
      <template v-else>{{ progressMap.get(achievement.id)?.count ?? 0 }}/{{ achievement.progress }}</template>
    </span>
  </li>
</template>

<style scoped>
.achievement {
  position: relative;
  flex: none;
  height: calc(var(--unit) * 106);
  background: #f5f0eb;
}

.medal {
  position: absolute;
  top: calc(var(--unit) * 11);
  left: calc(var(--unit) * 25);
  width: calc(var(--unit) * 80);
  height: calc(var(--unit) * 80);
  background: #d5b795;
}

.text {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 130);
  display: flex;
  width: calc(var(--unit) * 580);
  flex-direction: column;
  justify-content: center;
  gap: calc(var(--unit) * 3);
}

.title {
  margin: 0;
  color: #3d372e;
  font-size: calc(var(--unit) * 24);
  font-weight: 400;
  line-height: calc(var(--unit) * 30);
}

.description {
  margin: 0;
  color: #8a8275;
  font-size: calc(var(--unit) * 20);
  line-height: calc(var(--unit) * 24);
}

.reward {
  position: absolute;
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 745);
  width: calc(var(--unit) * 63);
  height: calc(var(--unit) * 63);
  background: #b19574;
}

.primogems {
  position: absolute;
  right: 0;
  bottom: calc(var(--unit) * 3);
  left: 0;
  color: #fff;
  font-size: calc(var(--unit) * 18);
  line-height: calc(var(--unit) * 18);
  text-align: center;
  text-shadow: 0 0 calc(var(--unit) * 2) #000;
}

.progress {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 830);
  display: flex;
  width: calc(var(--unit) * 142);
  background: #f1e9dd;
  color: #7a7263;
  font-size: calc(var(--unit) * 22);
  align-items: center;
  justify-content: center;
}

.stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 130);
  height: calc(var(--unit) * 130);
  border: calc(var(--unit) * 4) solid rgb(150 140 120 / 0.35);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>
