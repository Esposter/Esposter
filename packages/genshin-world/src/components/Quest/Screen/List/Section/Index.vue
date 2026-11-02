<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import QuestRow from "#src/components/Quest/Row/Index.vue";
import { QuestCategory } from "#src/models/quest/QuestCategory";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QuestCategoryGameTextKeyMap } from "#src/services/quest/QuestCategoryGameTextKeyMap";
import { QuestCategoryGlyphMap } from "#src/services/quest/QuestCategoryGlyphMap";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { GAME_CREAM } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The series of the category, each with the quests it lists under its own row
  chapters: { chapter: QuestChapter; chapterQuests: Quest[] }[];
  // The game's words in the reader's language
  gameText: GameText;
  // The category the section lists the quests of, under its heading
  questCategory: QuestCategory;
  // How far each quest in progress's objective stands from the player, in metres, by quest id, for those with a place
  questDistanceMap: ReadonlyMap<string, number>;
  // The quests of the category in no series, listed under its heading before the series
  rowQuests: Quest[];
  // The quest the list has selected
  selectedQuestId: string;
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { chapters, gameText, questCategory, questDistanceMap, rowQuests, selectedQuestId, textMap } =
  defineProps<Props>();
const emit = defineEmits<{ select: [questId: string] }>();
// How far each quest stands in the reader's words, by quest id, for those with a place to go to
const questDistanceTexts = computed(
  () =>
    new Map(
      [...questDistanceMap].map(
        ([questId, distance]) =>
          [questId, fillGameTextValues(gameText[GameTextKey.QuestDistance], Math.round(distance))] as const,
      ),
    ),
);
</script>

<template>
  <section>
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
      :distance="questDistanceTexts.get(id) ?? ''"
      :is-commission="questCategory === QuestCategory.Commission"
      :title="textMap[titleTextId] ?? ''"
      @click="emit('select', id)"
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
          :distance="questDistanceTexts.get(id) ?? ''"
          :title="textMap[titleTextId] ?? ''"
          @click="emit('select', id)"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Its capitals' tops 19 below its block's, and its mark the list's own tab mark at 0.54 of its size */
.heading {
  position: relative;
  height: calc(var(--unit) * 56);
  margin: calc(var(--unit) * 12) 0 calc(var(--unit) * 1);
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
  box-shadow: 0 0 0 calc(var(--unit) * 2) v-bind(GAME_CREAM);
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

/* Their left 39.3 in from the row's inner edge, inside the blue bar */
.chapter-title,
.chapter-region {
  position: absolute;
  left: calc(var(--unit) * 39.3);
  white-space: nowrap;
}

/* Its capitals' tops 17 below the row's, spaced out to the still's line width */
.chapter-title {
  top: calc(var(--unit) * 13.05);
  color: #d0be9a;
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 1.6);
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
</style>
