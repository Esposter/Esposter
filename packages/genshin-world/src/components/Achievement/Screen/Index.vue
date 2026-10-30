<script setup lang="ts">
import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { GameText } from "genshin-text";

import { useListScreenTabStep } from "#src/composables/useListScreenTabStep";
import { checkIsAchievementFinished } from "#src/services/achievement/checkIsAchievementFinished";
import { CloseButton, CloseButtonMark, GameScreen } from "genshin-interface";
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
const checkIsFinished = (achievement: Achievement): boolean => checkIsAchievementFinished(achievement.id, progressMap);
// The finished achievements sit after the ones still to do, each group in its table order
const selectedAchievements = computed(() =>
  (categoryAchievementsMap.value.get(selectedCategoryId.value) ?? []).toSorted(
    (firstAchievement, secondAchievement) =>
      Number(checkIsFinished(firstAchievement)) - Number(checkIsFinished(secondAchievement)) ||
      firstAchievement.orderId - secondAchievement.orderId,
  ),
);
const finishedCount = (categoryId: number): number =>
  (categoryAchievementsMap.value.get(categoryId) ?? []).filter(checkIsFinished).length;
// The share of a category's achievements that are finished, as the list and the banner read it
const categoryPercent = (categoryId: number): number => {
  const total = categoryAchievementsMap.value.get(categoryId)?.length ?? 0;
  return total === 0 ? 0 : Math.round((finishedCount(categoryId) / total) * 100);
};
// A hidden achievement shows nothing of itself until it is finished
const checkIsRevealed = (achievement: Achievement): boolean => !achievement.isHidden || checkIsFinished(achievement);
// The list opens scrolled to the selected category, and follows it when Q or E steps to another
const listElement = useTemplateRef<HTMLElement>("list");
const scrollSelectedIntoView = (): void => {
  listElement.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
};
onMounted(scrollSelectedIntoView);
watch(selectedCategoryId, scrollSelectedIntoView, { flush: "post" });
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
  <!-- The game's achievements screen over the blurred world: its title under a laurel and the back disc across the top,
       the search box, and the categories down the left, each with its share of finished achievements. The selected
       category's banner and its achievements sit on the cream panel to the right, each with its reward, its progress and
       a stamp once it is finished. The words the banner, the search box and the header's count draw are not in
       GameTextKey, and the laurel, the category badges, the medals, the namecard and the Primogem are the game's art, so
       they are flat placeholders -->
  <GameScreen class="achievement-screen">
    <span class="laurel" />
    <p class="heading" role="heading" aria-level="1">{{ gameText[GameTextKey.Achievements] }}</p>
    <CloseButton
      class="close"
      :label="gameText[GameTextKey.Back]"
      :mark="CloseButtonMark.Back"
      @click="emit('close')"
    />
    <span class="search">
      <svg class="magnifier" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="7.5" cy="7.5" r="6" />
        <path d="M12 12 17 17" />
      </svg>
    </span>
    <div ref="list" class="list" role="tablist" aria-orientation="vertical">
      <button
        v-for="category of categories"
        :key="category.id"
        class="category"
        role="tab"
        type="button"
        :aria-selected="category.id === selectedCategoryId"
        @click="selectedCategoryId = category.id"
      >
        <span class="badge" />
        <span class="name">{{ textMap[category.nameTextId] }}</span>
        <span class="percent">{{ categoryPercent(category.id) }} %</span>
      </button>
    </div>
    <div class="frame" />
    <div class="banner">
      <span class="namecard" />
      <span class="rate">{{ selectedCategory ? categoryPercent(selectedCategory.id) : 0 }} %</span>
      <span class="track"><span class="fill" /></span>
      <span class="status" />
    </div>
    <ul class="achievements">
      <li v-for="achievement of selectedAchievements" :key="achievement.id" class="achievement">
        <span class="medal" />
        <div class="text">
          <p class="title">{{ checkIsRevealed(achievement) ? textMap[achievement.titleTextId] : "?" }}</p>
          <p v-if="checkIsRevealed(achievement)" class="description">{{ textMap[achievement.descriptionTextId] }}</p>
        </div>
        <span class="reward">
          <span class="primogems">{{ achievement.primogems }}</span>
        </span>
        <span class="progress">
          <span v-if="checkIsFinished(achievement)" class="stamp" />
          <template v-else>{{ progressMap.get(achievement.id)?.count ?? 0 }}/{{ achievement.progress }}</template>
        </span>
      </li>
    </ul>
  </GameScreen>
</template>

<style scoped>
/* The unit is a pixel of the game's 1920 by 1080 screen, so every value is measured from the reference frame, its left
   edge at 96 and the screen drawn from there, and written as the canvas's own pixels */
.achievement-screen {
  color: #fff;
}

.laurel {
  position: absolute;
  top: calc(var(--unit) * 12);
  left: calc(var(--unit) * 37);
  width: calc(var(--unit) * 64);
  height: calc(var(--unit) * 64);
  border-radius: calc(var(--unit) * 12);
  background: #b99a64;
}

.heading {
  position: absolute;
  top: calc(var(--unit) * 27);
  left: calc(var(--unit) * 129);
  margin: 0;
  color: #e2c486;
  font-size: calc(var(--unit) * 24);
  font-weight: 400;
  line-height: calc(var(--unit) * 30);
}

/* The back disc, placed at the reference's top right: its right edge 232 from the window's and its top 14 down */
.close {
  top: calc(var(--unit) * 14);
  right: calc(var(--unit) * 232);
}

.search {
  position: absolute;
  top: calc(var(--unit) * 100);
  left: calc(var(--unit) * 56);
  box-sizing: border-box;
  width: calc(var(--unit) * 534);
  height: calc(var(--unit) * 41);
  border: calc(var(--unit) * 2) solid rgb(200 200 206 / 0.85);
  border-radius: calc(var(--unit) * 21);
  background: #2f3345;
}

.magnifier {
  position: absolute;
  top: calc(var(--unit) * 11);
  left: calc(var(--unit) * 15);
  width: calc(var(--unit) * 18);
  height: calc(var(--unit) * 18);
  fill: none;
  stroke: #fff;
  stroke-width: 2;
  stroke-linecap: round;
}

/* The list is scrolled to the selected category, its rows 534 wide and its bar at the right edge; its left padding holds
   the pointer that marks the selected row */
.list {
  position: absolute;
  top: calc(var(--unit) * 143);
  left: calc(var(--unit) * 34);
  box-sizing: border-box;
  display: flex;
  width: calc(var(--unit) * 578);
  height: calc(var(--unit) * 879);
  padding-left: calc(var(--unit) * 22);
  flex-direction: column;
  overflow-y: auto;
  scroll-padding-bottom: calc(var(--unit) * 19);
  gap: calc(var(--unit) * 9.75);
  scrollbar-color: rgb(190 190 195) transparent;
  scrollbar-width: thin;
}

.category {
  position: relative;
  flex: none;
  box-sizing: border-box;
  width: calc(var(--unit) * 534);
  height: calc(var(--unit) * 83);
  margin: 0;
  padding: 0;
  border: none;
  background: #353f4e;
  color: #ebe7dc;
  font: inherit;
  text-align: left;
  cursor: inherit;
}

.category[aria-selected="true"] {
  width: calc(var(--unit) * 556);
  margin-left: calc(var(--unit) * -11);
  outline: calc(var(--unit) * 2) solid #fff;
  outline-offset: 0;
  background: #eae2d3;
  color: #2e2a24;
}

.category[aria-selected="true"]::before {
  position: absolute;
  top: calc(50% - var(--unit) * 6);
  left: calc(var(--unit) * -11);
  width: 0;
  height: 0;
  border-top: calc(var(--unit) * 6) solid transparent;
  border-bottom: calc(var(--unit) * 6) solid transparent;
  border-left: calc(var(--unit) * 8) solid #fff;
  content: "";
}

.badge {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 18);
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 32);
  background: #938a76;
}

.name {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 65);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 28);
  white-space: nowrap;
}

.percent {
  position: absolute;
  top: calc(var(--unit) * 46);
  left: calc(var(--unit) * 65);
  color: #cfcac0;
  font-size: calc(var(--unit) * 20);
  line-height: calc(var(--unit) * 22);
}

.category[aria-selected="true"] .percent {
  color: #3a342a;
}

/* The cream panel with its dark slate frame, its corners and bottom drawn by the frame's own pieces */
.frame {
  position: absolute;
  top: calc(var(--unit) * 95);
  left: calc(var(--unit) * 626);
  width: calc(var(--unit) * 1054);
  height: calc(var(--unit) * 927);
  background: #444854;
}

.frame::after {
  position: absolute;
  top: calc(var(--unit) * 15);
  left: calc(var(--unit) * 16);
  width: calc(var(--unit) * 1022);
  height: calc(var(--unit) * 898);
  background: #f1ebe6;
  content: "";
}

.banner {
  position: absolute;
  top: calc(var(--unit) * 130);
  left: calc(var(--unit) * 656);
  width: calc(var(--unit) * 990);
  height: calc(var(--unit) * 110);
  background: #fbf7f1;
}

.namecard {
  position: absolute;
  top: calc(var(--unit) * 13);
  left: calc(var(--unit) * 21);
  width: calc(var(--unit) * 87);
  height: calc(var(--unit) * 85);
  background: #889cc0;
}

.rate {
  position: absolute;
  top: calc(var(--unit) * 20);
  right: calc(var(--unit) * 160);
  color: #3a3328;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 26);
}

.track {
  position: absolute;
  top: calc(var(--unit) * 54);
  left: calc(var(--unit) * 131);
  width: calc(var(--unit) * 697);
  height: calc(var(--unit) * 9);
  background: #87857f;
}

.fill {
  display: block;
  width: 33.3%;
  height: 100%;
  background: #eeb84c;
}

/* The tail of the banner, its own ground, where the game shows the progress's state */
.status {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 845);
  width: calc(var(--unit) * 145);
  height: 100%;
  background: #f0e9de;
}

.achievements {
  position: absolute;
  top: calc(var(--unit) * 260);
  left: calc(var(--unit) * 664);
  display: flex;
  width: calc(var(--unit) * 972);
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: calc(var(--unit) * 6);
  list-style: none;
}

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
