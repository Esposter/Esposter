<script setup lang="ts">
import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { GameText } from "genshin-text";

import MenuListScreenDetail from "#src/components/Menu/ListScreen/Detail/Index.vue";
import MenuListScreen from "#src/components/Menu/ListScreen/Index.vue";
import MenuListScreenTab from "#src/components/Menu/ListScreen/Tab/Index.vue";
import { useListScreenTabStep } from "#src/composables/useListScreenTabStep";
import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";
import { GameTextKey } from "genshin-text";

interface Props {
  achievements: readonly Achievement[];
  categories: readonly AchievementCategory[];
  // The game's words in the reader's language
  gameText: GameText;
  // The category the list opens on, the first category when absent
  initialCategoryId?: number;
  progressMap: ReadonlyMap<number, AchievementProgress>;
  // The achievements' and categories' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { achievements, categories, gameText, initialCategoryId, progressMap, textMap } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const selectedCategoryId = ref(initialCategoryId ?? categories[0]?.id ?? 0);
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
useListScreenTabStep(
  () => categories.findIndex(({ id }) => id === selectedCategoryId.value),
  () => categories.length,
  (categoryIndex) => {
    const category = categories[categoryIndex];
    if (category) selectedCategoryId.value = category.id;
  },
);
</script>

<template>
  <!-- The game's achievements screen, which the Paimon menu opens: its categories down the left, each with how many of its
       Achievements are finished, and the selected category's achievements on the right, each with its words, its count
       When it has one, and its Primogems. A hidden achievement reads "?" until it is finished. Not yet built: the category
       Icons, the Primogem glyph, the namecard a finished category pays, and the look the English client draws -->
  <MenuListScreen :game-text :title="gameText[GameTextKey.Achievements]" @close="emit('close')">
    <template #list>
      <div class="list" role="tablist" aria-orientation="vertical">
        <MenuListScreenTab
          v-for="category of categories"
          :key="category.id"
          :aria-selected="category.id === selectedCategoryId"
          @click="selectedCategoryId = category.id"
        >
          <span class="name">{{ textMap[category.nameTextId] }}</span>
          <span class="count"
            >{{ finishedCount(category.id) }}/{{ categoryAchievementsMap.get(category.id)?.length ?? 0 }}</span
          >
        </MenuListScreenTab>
      </div>
    </template>
    <template #detail>
      <MenuListScreenDetail v-if="selectedCategory" :aria-label="textMap[selectedCategory.nameTextId]">
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
      </MenuListScreenDetail>
    </template>
  </MenuListScreen>
</template>

<style scoped>
.title {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
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
