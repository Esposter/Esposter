<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import MenuListScreen from "#src/components/Menu/ListScreen/Index.vue";
import QuestRow from "#src/components/Quest/Row/Index.vue";
import { QuestCategory } from "#src/models/quest/QuestCategory";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QUEST_CATEGORIES, QUEST_TAB_NEXT_CODE, QUEST_TAB_PREVIOUS_CODE } from "#src/services/quest/constants";
import { getQuestCounter } from "#src/services/quest/getQuestCounter";
import { QuestCategoryGameTextKeyMap } from "#src/services/quest/QuestCategoryGameTextKeyMap";
import { QuestCategoryGlyphMap } from "#src/services/quest/QuestCategoryGlyphMap";
import { QuestCategoryShadeGlyphMap } from "#src/services/quest/QuestCategoryShadeGlyphMap";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { QuestKindCategoryMap } from "#src/services/quest/QuestKindCategoryMap";
import { checkIsActionKey } from "#src/services/shared/checkIsActionKey";
import { useEventListener } from "@vueuse/core";
import { InputAction } from "genshin-engine";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The series the quests in progress belong to, each listing its quests under its own row, none while no series is
  // Carried
  questChapters?: QuestChapter[];
  // How far each quest in progress's objective stands from the player, in metres, by quest id, for those with a place
  questDistanceMap: ReadonlyMap<string, number>;
  questProgressMap: ReadonlyMap<string, QuestProgress>;
  // The quests in progress
  quests: Quest[];
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
  // The quest being navigated to, "" with none
  trackedQuestId: string;
}

const {
  gameText,
  questChapters = [],
  questDistanceMap,
  questProgressMap,
  quests,
  textMap,
  trackedQuestId,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; navigate: [questId: string] }>();
// The tab open, none for the first, which lists every quest
const category = ref<QuestCategory>();
const selectedQuestId = ref(trackedQuestId || (quests[0]?.id ?? ""));
// Provisional: the title over a list's own tab names the list, as the first tab's names what it lists
const listTitle = computed(
  () => gameText[category.value ? QuestCategoryGameTextKeyMap[category.value] : GameTextKey.QuestsInProgress],
);
// Each list the open tab shows, under its heading: its quests in no series, then each series holding any of its quests
// With those quests in the series' order
const questGroups = computed(() =>
  (category.value ? [category.value] : QUEST_CATEGORIES)
    .map((questCategory) => {
      const categoryQuests = quests.filter(({ kind }) => QuestKindCategoryMap[kind] === questCategory);
      const chapters = questChapters
        .map((chapter) => ({
          chapter,
          chapterQuests: chapter.questIds.flatMap((questId) => categoryQuests.filter(({ id }) => id === questId)),
        }))
        .filter(({ chapterQuests }) => chapterQuests.length > 0);
      const chapterQuestIds = new Set(chapters.flatMap(({ chapter }) => chapter.questIds));
      return { chapters, questCategory, rowQuests: categoryQuests.filter(({ id }) => !chapterQuestIds.has(id)) };
    })
    .filter(({ chapters, rowQuests }) => chapters.length > 0 || rowQuests.length > 0),
);
const selectedQuest = computed(() => quests.find(({ id }) => id === selectedQuestId.value));
const selectedChapter = computed(() => questChapters.find(({ questIds }) => questIds.includes(selectedQuestId.value)));
// The selected quest's step, and how far its first counted objective has come
const questStep = computed(() => {
  if (!selectedQuest.value) return undefined;
  const { objectiveCounts, stepIndex } = questProgressMap.get(selectedQuest.value.id) ?? {
    objectiveCounts: [],
    stepIndex: 0,
  };
  const step = selectedQuest.value.steps[stepIndex];
  if (!step) return undefined;
  return { counter: getQuestCounter(step, objectiveCounts), textId: step.textId };
});
// How far a quest stands in the reader's words, "" for a quest with no place
const getQuestDistance = (questId: string): string => {
  const distance = questDistanceMap.get(questId);
  return distance === undefined ? "" : fillGameTextValues(gameText[GameTextKey.QuestDistance], Math.round(distance));
};
const navigate = (questId: string) => {
  emit("navigate", questId === trackedQuestId ? "" : questId);
};
// Q and E step between the tabs, held at the first and the last, and F navigates to the selected quest or cancels it
useEventListener("keydown", (event) => {
  const tabIndex = category.value ? QUEST_CATEGORIES.indexOf(category.value) + 1 : 0;
  if (event.code === QUEST_TAB_PREVIOUS_CODE || event.code === QUEST_TAB_NEXT_CODE) {
    const step = event.code === QUEST_TAB_NEXT_CODE ? 1 : -1;
    const newTabIndex = Math.min(Math.max(tabIndex + step, 0), QUEST_CATEGORIES.length);
    category.value = QUEST_CATEGORIES[newTabIndex - 1];
  } else if (selectedQuest.value && checkIsActionKey(InputAction.Interact, event.code))
    navigate(selectedQuest.value.id);
});
</script>

<template>
  <!-- The game's quest screen, which J opens, as the English client's still at 1920 by 1080 lays it out
       (`File:Quest Screen.png`, its places in `Layout.reference.ts`): the banner and the list's title, the tabs along
       The top, every quest in progress listed down the left under its kind's heading and a series' quests under the
       Series' row, and the selected quest's title, place, journal, objective, description and rewards on the right,
       Over the Quest Overview button and the one navigating to it. The game lays it over the world, blurred, which the
       Parity page has no copy of. Not drawn: the region's art on a series' row and the journal's emblem, the reward
       Items' art, the rewards' caption, the list's scroll bar and the UID -->
  <MenuListScreen :game-text :title="listTitle" @close="emit('close')">
    <template #icon>
      <MenuGlyph class="banner" :glyph="QuestGlyphMap[QuestGlyph.Banner]" />
    </template>
    <template #tabs>
      <div class="tabs" role="tablist">
        <button
          class="tab"
          :aria-label="gameText[GameTextKey.QuestsInProgress]"
          :aria-selected="!category"
          role="tab"
          type="button"
          @click="category = undefined"
        >
          <MenuGlyph :glyph="QuestGlyphMap[QuestGlyph.AllQuests]" />
        </button>
        <button
          v-for="questCategory of QUEST_CATEGORIES"
          :key="questCategory"
          class="tab"
          :aria-label="gameText[QuestCategoryGameTextKeyMap[questCategory]]"
          :aria-selected="category === questCategory"
          role="tab"
          type="button"
          @click="category = questCategory"
        >
          <MenuGlyph class="shade" :glyph="QuestCategoryShadeGlyphMap[questCategory]" />
          <MenuGlyph :glyph="QuestCategoryGlyphMap[questCategory]" />
        </button>
      </div>
    </template>
    <template #list>
      <div class="list" role="tabpanel" :aria-label="listTitle">
        <section v-for="{ chapters, questCategory, rowQuests } of questGroups" :key="questCategory">
          <p class="heading" role="heading" aria-level="2">
            <svg class="heading-mark" aria-hidden="true" viewBox="0 0 60 64">
              <path v-for="(path, index) of QuestCategoryGlyphMap[questCategory].paths" :key="index" :d="path" />
            </svg>
            {{ gameText[QuestCategoryGameTextKeyMap[questCategory]] }}
          </p>
          <QuestRow
            v-for="{ id, titleTextId } of rowQuests"
            :key="id"
            class="quest"
            :class="{ selected: id === selectedQuestId }"
            :distance="getQuestDistance(id)"
            :is-commission="questCategory === QuestCategory.Commission"
            :title="textMap[titleTextId] ?? ''"
            @click="selectedQuestId = id"
          />
          <template v-for="{ chapter, chapterQuests } of chapters" :key="chapter.id">
            <p class="chapter" role="heading" aria-level="3">
              <MenuGlyph :glyph="QuestGlyphMap[QuestGlyph.Series]" />
              <span class="chapter-title">{{ textMap[chapter.titleTextId] ?? "" }}</span>
              <span v-if="chapter.numberTextId" class="chapter-number">{{ textMap[chapter.numberTextId] ?? "" }}</span>
              <span class="chapter-region">{{ textMap[chapter.regionTextId] ?? "" }}</span>
            </p>
            <div class="chapter-quests">
              <QuestRow
                v-for="{ id, titleTextId } of chapterQuests"
                :key="id"
                class="quest"
                :class="{ selected: id === selectedQuestId }"
                :distance="getQuestDistance(id)"
                :title="textMap[titleTextId] ?? ''"
                @click="selectedQuestId = id"
              />
            </div>
          </template>
        </section>
      </div>
    </template>
    <template #detail>
      <div v-if="selectedQuest" class="details">
        <p class="detail-title" role="heading" aria-level="1">{{ textMap[selectedQuest.titleTextId] }}</p>
        <MenuGlyph class="place" :glyph="QuestGlyphMap[QuestGlyph.Place]" />
        <template v-if="selectedChapter">
          <p class="journal">{{ textMap[selectedChapter.journalTextId] ?? "" }}</p>
          <span class="journal-emblem" />
        </template>
        <span class="divider" />
        <p v-if="questStep" class="step">
          <MenuGlyph class="objective" :glyph="QuestGlyphMap[QuestGlyph.ObjectiveRing]" />
          <MenuGlyph class="objective" :glyph="QuestGlyphMap[QuestGlyph.ObjectiveCore]" />
          <span>{{ textMap[questStep.textId] }}</span>
          <span>{{ questStep.counter }}</span>
        </p>
        <p class="description">{{ textMap[selectedQuest.descriptionTextId] }}</p>
        <template v-if="selectedChapter">
          <span class="lower-divider" />
          <ul class="rewards">
            <li
              v-for="{ count, itemId, rarity } of selectedChapter.rewards"
              :key="itemId"
              class="reward"
              :data-rarity="rarity"
            >
              <span class="reward-count">{{ count }}</span>
            </li>
          </ul>
        </template>
        <button class="pill navigate" type="button" @click="navigate(selectedQuest.id)">
          <svg class="navigate-mark" aria-hidden="true" viewBox="0 0 32 32">
            <path
              v-for="(path, index) of QuestGlyphMap[QuestGlyph.ObjectiveRing].paths"
              :key="index"
              class="navigate-ring"
              :d="path"
            />
            <path v-for="(path, index) of QuestGlyphMap[QuestGlyph.ObjectiveCore].paths" :key="index" :d="path" />
          </svg>
          <span class="navigate-label">
            {{
              gameText[
                selectedQuest.id === trackedQuestId ? GameTextKey.QuestCancelNavigation : GameTextKey.QuestNavigate
              ]
            }}
          </span>
          <span class="navigate-key" aria-hidden="true">F</span>
        </button>
      </div>
      <span class="footer-line" />
      <!-- The overview of every quest is not built, so its button is drawn and does nothing -->
      <button class="pill overview" type="button" disabled>
        <MenuGlyph :glyph="QuestGlyphMap[QuestGlyph.Overview]" />
        {{ gameText[GameTextKey.QuestOverview] }}
      </button>
    </template>
  </MenuListScreen>
</template>

<style scoped>
.banner {
  color: #cfbd9e;
}

.tab,
.pill {
  margin: 0;
  padding: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.tabs {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 720);
  display: flex;
}

.tab {
  position: relative;
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 96);
  background: none;
  color: #bebaba;
}

/* The open tab's mark sits dark on a cream disc over the gold line along its foot */
.tab[aria-selected="true"] {
  color: #4a505d;
}

.tab[aria-selected="true"]::before {
  position: absolute;
  top: calc(var(--unit) * 17);
  left: calc(var(--unit) * 17);
  width: calc(var(--unit) * 62);
  height: calc(var(--unit) * 62);
  border-radius: 50%;
  background: #ebe7d8;
  content: "";
}

.tab[aria-selected="true"]::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: calc(var(--unit) * 4);
  background: #d7c28f;
  content: "";
}

/* The mark's paler parts, read off the still at 0.24 to 0.4 of its bright parts */
.shade {
  opacity: 0.3;
}

/* Its capitals' tops 19 below its block's, and its mark the list's own tab mark at 0.54 of its size */
.heading {
  position: relative;
  height: calc(var(--unit) * 56);
  margin: calc(var(--unit) * 10) 0 calc(var(--unit) * 3);
  padding-left: calc(var(--unit) * 46);
  color: #ede8e1;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  line-height: calc(var(--unit) * 56);
}

.heading-mark {
  position: absolute;
  top: calc(var(--unit) * 11.4);
  left: calc(var(--unit) * 4);
  width: calc(var(--unit) * 32.6);
  height: calc(var(--unit) * 34.8);
  fill: currentColor;
}

.quest + .quest,
.quest + .chapter {
  margin-top: calc(var(--unit) * 13);
}

/* Provisional: the still shows no selected row, so the selected one is ringed in the game's cream */
.quest.selected {
  box-shadow: 0 0 0 calc(var(--unit) * 2) #ece5d8;
}

/* A series' row: its fill fitted against the world just over it, a blue bar down its left and a blue glow inside its
   Foot and ends */
.chapter {
  position: relative;
  height: calc(var(--unit) * 85);
  margin: 0;
  border-left: calc(var(--unit) * 5) solid #7c98e5;
  background:
    linear-gradient(to top, rgb(77 96 160 / 0.6), transparent calc(var(--unit) * 14)),
    linear-gradient(to right, rgb(60 80 150 / 0.5), transparent calc(var(--unit) * 110)),
    linear-gradient(to left, rgb(60 80 150 / 0.5), transparent calc(var(--unit) * 40)), rgb(45 58 74 / 0.85);
  box-shadow: 0 0 0 calc(var(--unit) * 1) rgb(76 95 161 / 0.6);
  color: #ccbea7;
  font-weight: 600;
}

/* Their left 46 in from the list's, inside the blue bar */
.chapter-title,
.chapter-number,
.chapter-region {
  position: absolute;
  left: calc(var(--unit) * 41);
  white-space: nowrap;
}

/* Its capitals' tops 17 below the row's */
.chapter-title {
  top: calc(var(--unit) * 13.05);
  color: #d0be9a;
  font-size: calc(var(--unit) * 28);
  line-height: calc(var(--unit) * 28);
}

/* Its capitals' tops 47.5 below the row's */
.chapter-region {
  top: calc(var(--unit) * 44.3);
  color: #8a8886;
  font-size: calc(var(--unit) * 23);
  line-height: calc(var(--unit) * 23);
}

/* Its number on the row's right beneath its title, where the still shows no number: a best estimate, not measured */
.chapter-number {
  position: absolute;
  top: calc(var(--unit) * 44.3);
  right: calc(var(--unit) * 41);
  color: #8a8886;
  font-size: calc(var(--unit) * 23);
  line-height: calc(var(--unit) * 23);
  white-space: nowrap;
}

/* A series' quests on a paler panel inset under its row, their titles a size larger than the commissions' */
.chapter-quests {
  margin: 0 calc(var(--unit) * 8);
  padding: calc(var(--unit) * 12) calc(var(--unit) * 13) calc(var(--unit) * 13);
  background: rgb(255 255 255 / 0.14);
}

.chapter-quests .quest {
  font-size: calc(var(--unit) * 27);
}

.chapter-quests .quest + .quest {
  margin-top: calc(var(--unit) * 10);
}

.chapter-quests + .chapter {
  margin-top: calc(var(--unit) * 19);
}

.details {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 877);
  width: calc(var(--unit) * 899);
}

.detail-title,
.journal,
.step,
.description {
  margin: 0;
  font-weight: 600;
}

/* Its capitals' tops at 128.5 */
.detail-title {
  position: absolute;
  top: calc(var(--unit) * 123.6);
  left: calc(var(--unit) * 1);
  color: #ede8e0;
  font-size: calc(var(--unit) * 35);
  line-height: calc(var(--unit) * 35);
  white-space: nowrap;
}

.place {
  color: #d2bfa2;
}

/* Its capitals' tops at 176.5, ending 17 short of the emblem */
.journal {
  position: absolute;
  top: calc(var(--unit) * 172.8);
  right: calc(var(--unit) * 65);
  color: #d1be9a;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 26);
  white-space: nowrap;
}

.journal-emblem {
  position: absolute;
  top: calc(var(--unit) * 167);
  left: calc(var(--unit) * 851);
  width: calc(var(--unit) * 39);
  height: calc(var(--unit) * 39);
  border-radius: 50%;
  background: #ede8e0;
}

.divider,
.lower-divider,
.footer-line {
  position: absolute;
  height: calc(var(--unit) * 2);
}

.divider {
  top: calc(var(--unit) * 218);
  left: calc(var(--unit) * -32);
  width: calc(var(--unit) * 963);
  background: rgb(255 255 255 / 0.09);
}

/* Its line's capitals' tops 17.5 below the bar's */
.step {
  position: absolute;
  top: calc(var(--unit) * 241);
  right: 0;
  left: 0;
  display: flex;
  height: calc(var(--unit) * 56);
  box-sizing: border-box;
  padding: calc(var(--unit) * 13.8) calc(var(--unit) * 17) 0 calc(var(--unit) * 54);
  background: rgb(0 0 0 / 0.1);
  color: #ece7e1;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 26);
  justify-content: space-between;
}

.objective {
  color: #cdc0a4;
}

/* Its first line's capitals' tops at 319 */
.description {
  position: absolute;
  top: calc(var(--unit) * 313.7);
  left: calc(var(--unit) * 1);
  width: calc(var(--unit) * 899);
  color: #ede7df;
  font-size: calc(var(--unit) * 27);
  line-height: calc(var(--unit) * 30);
}

.lower-divider {
  top: calc(var(--unit) * 773);
  left: 0;
  width: 100%;
  background: rgb(255 255 255 / 0.06);
}

.rewards {
  position: absolute;
  top: calc(var(--unit) * 831);
  left: calc(var(--unit) * 1);
  display: flex;
  gap: calc(var(--unit) * 16.5);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A tile shaded by its item's rarity, three stars and under in blue, four in purple and five in gold, its count on a
   Band along its foot */
.reward {
  position: relative;
  width: calc(var(--unit) * 94);
  height: calc(var(--unit) * 94);
  overflow: hidden;
  border-radius: calc(var(--unit) * 6);
  background: linear-gradient(#5a698f, #5482aa);
}

.reward[data-rarity="4"] {
  background: linear-gradient(#666094, #8870b3);
}

.reward[data-rarity="5"] {
  background: linear-gradient(#9e6a3c, #ba7831);
}

.reward-count {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: calc(var(--unit) * 23);
  background: rgb(70 82 101 / 0.73);
  color: #fff;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 23);
  text-align: center;
}

.footer-line {
  top: calc(var(--unit) * 963);
  right: calc(var(--unit) * 30);
  left: calc(var(--unit) * 35);
  background: rgb(255 255 255 / 0.07);
}

.pill {
  position: absolute;
  top: calc(var(--unit) * 989);
  width: calc(var(--unit) * 288);
  height: calc(var(--unit) * 62);
  border-radius: calc(var(--unit) * 31);
  background: #ece5d7;
  color: #3c404b;
  font-size: calc(var(--unit) * 27);
}

/* Its capitals' tops 20.5 below the pill's */
.overview {
  left: calc(var(--unit) * 144);
  padding-left: calc(var(--unit) * 59);
  color: #3a414e;
  line-height: calc(var(--unit) * 62);
  text-align: start;
}

/* Its button 1512 across the screen, under the details */
.navigate {
  left: calc(var(--unit) * 635);
}

/* The objective's mark at 47 across, its ring grey round a dark core */
.navigate-mark {
  position: absolute;
  top: calc(var(--unit) * 5);
  left: calc(var(--unit) * 8);
  width: calc(var(--unit) * 47);
  height: calc(var(--unit) * 47);
  fill: #3b4250;
}

.navigate-ring {
  fill: #c0bdb5;
}

/* Centred 161 in from the pill's left, two lines 30 apart when it wraps. Narrowed to 190 so the stand-in font, narrower
   Than the game's, breaks Cancel Navigation where the game's does */
.navigate-label {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 66);
  display: grid;
  width: calc(var(--unit) * 190);
  line-height: calc(var(--unit) * 30);
  place-items: center;
  text-align: center;
}

.navigate-key {
  position: absolute;
  top: calc(var(--unit) * 41);
  left: 0;
  display: grid;
  width: calc(var(--unit) * 19);
  height: calc(var(--unit) * 21);
  border-radius: calc(var(--unit) * 2);
  background: #f7f2ef;
  color: #433f3e;
  font-size: calc(var(--unit) * 16);
  place-items: center;
}
</style>
