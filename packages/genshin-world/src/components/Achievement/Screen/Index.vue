<script setup lang="ts">
import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { GameText } from "genshin-text";

import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";
import { QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
import { useEventListener } from "@vueuse/core";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  achievements: readonly Achievement[];
  categories: readonly AchievementCategory[];
  // The game's words in the reader's language
  gameText: GameText;
  progressMap: ReadonlyMap<number, AchievementProgress>;
  // The achievements' and categories' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { achievements, categories, gameText, progressMap, textMap } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const selectedCategoryId = ref(categories[0]?.id ?? 0);
const selectedCategory = computed(() => categories.find(({ id }) => id === selectedCategoryId.value));
const categoryAchievementsMap = computed(() => Map.groupBy(achievements, ({ categoryId }) => categoryId));
const selectedAchievements = computed(() =>
  (categoryAchievementsMap.value.get(selectedCategoryId.value) ?? []).toSorted(
    (firstAchievement, secondAchievement) => firstAchievement.orderId - secondAchievement.orderId,
  ),
);
const finishedCount = (categoryId: number): number =>
  (categoryAchievementsMap.value.get(categoryId) ?? []).filter(({ id }) => checkIsAchievementFinished(id, progressMap))
    .length;
// A hidden achievement shows nothing of itself until it is finished
const checkIsRevealed = (achievement: Achievement): boolean =>
  !achievement.isHidden || checkIsAchievementFinished(achievement.id, progressMap);
// Q and E step between the categories, held at the first and the last
useEventListener("keydown", (event) => {
  if (event.code !== QUEST_TAB_PREVIOUS_CODE && event.code !== QUEST_TAB_NEXT_CODE) return;
  const step = event.code === QUEST_TAB_NEXT_CODE ? 1 : -1;
  const categoryIndex = categories.findIndex(({ id }) => id === selectedCategoryId.value);
  const nextCategory = categories[Math.min(Math.max(categoryIndex + step, 0), categories.length - 1)];
  if (nextCategory) selectedCategoryId.value = nextCategory.id;
});
</script>

<template>
  <!-- The game's achievements screen, which the Paimon menu opens: its categories down the left, each with how many of its
       Achievements are finished, and the selected category's achievements on the right, each with its words, its count
       When it has one, and its Primogems. A hidden achievement reads "?" until it is finished. Not yet built: the category
       Icons, the Primogem glyph, the namecard a finished category pays, and the look the English client draws -->
  <GameScreen class="achievement-screen">
    <p class="header-title">{{ gameText[GameTextKey.Achievements] }}</p>
    <span class="key previous">Q</span>
    <span class="key next">E</span>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    <div class="categories" role="tablist" aria-orientation="vertical">
      <button
        v-for="category of categories"
        :key="category.id"
        class="category"
        :aria-selected="category.id === selectedCategoryId"
        role="tab"
        type="button"
        @click="selectedCategoryId = category.id"
      >
        <span class="name">{{ textMap[category.nameTextId] }}</span>
        <span class="count"
          >{{ finishedCount(category.id) }}/{{ categoryAchievementsMap.get(category.id)?.length ?? 0 }}</span
        >
      </button>
    </div>
    <div
      v-if="selectedCategory"
      class="achievements"
      role="tabpanel"
      :aria-label="textMap[selectedCategory.nameTextId]"
    >
      <div
        v-for="achievement of selectedAchievements"
        :key="achievement.id"
        class="achievement"
        :data-finished="checkIsAchievementFinished(achievement.id, progressMap) || undefined"
      >
        <p class="title">{{ checkIsRevealed(achievement) ? textMap[achievement.titleTextId] : "?" }}</p>
        <p v-if="checkIsRevealed(achievement)" class="description">{{ textMap[achievement.descriptionTextId] }}</p>
        <p class="reward">
          <span v-if="achievement.progress > 1">
            {{ progressMap.get(achievement.id)?.count ?? 0 }}/{{ achievement.progress }}
          </span>
          <span>{{ achievement.primogems }} {{ gameText[GameTextKey.Primogem] }}</span>
        </p>
      </div>
    </div>
  </GameScreen>
</template>

<style scoped>
.achievement-screen {
  color: #fff;
}

.header-title,
.category,
.close,
.title {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.header-title {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 144);
  height: calc(var(--unit) * 95);
  color: #d7c28f;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 95);
}

.key {
  position: absolute;
  top: calc(var(--unit) * 33);
  display: grid;
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 28);
  background: #ece5d8;
  color: #000;
  font-size: calc(var(--unit) * 20);
  place-items: center;
}

.key.previous {
  left: calc(var(--unit) * 675);
}

.key.next {
  left: calc(var(--unit) * 1213);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 50);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: calc(var(--unit) * 6);
  background: rgb(236 229 216 / 0.85);
  color: #3b4255;
  font-size: calc(var(--unit) * 40);
  line-height: 1;
}

.categories {
  position: absolute;
  top: calc(var(--unit) * 105);
  bottom: calc(var(--unit) * 125);
  left: calc(var(--unit) * 150);
  display: flex;
  width: calc(var(--unit) * 666);
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

.category {
  display: flex;
  height: calc(var(--unit) * 76);
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30) 0;
  background: rgb(40 50 70 / 0.72);
  color: inherit;
  font-size: calc(var(--unit) * 24);
  justify-content: space-between;
  text-align: start;
}

.category[aria-selected="true"] {
  outline: calc(var(--unit) * 2) solid #d3bc8e;
}

.achievements {
  position: absolute;
  top: calc(var(--unit) * 105);
  bottom: calc(var(--unit) * 125);
  left: calc(var(--unit) * 877);
  display: flex;
  width: calc(var(--unit) * 899);
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

.achievement {
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30);
  background: rgb(40 50 70 / 0.72);
}

.achievement[data-finished] {
  color: #e3c886;
}

.title {
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 30);
}

.description {
  margin: 0;
  font-size: calc(var(--unit) * 20);
  line-height: calc(var(--unit) * 26);
}

.reward {
  display: flex;
  margin: calc(var(--unit) * 6) 0 0;
  font-size: calc(var(--unit) * 20);
  justify-content: space-between;
}
</style>
