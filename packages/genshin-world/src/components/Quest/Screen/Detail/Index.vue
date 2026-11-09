<script setup lang="ts">
import type { Quest } from "#src/models/quest/Quest";
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import QuestScreenDetailNavigate from "#src/components/Quest/Screen/Detail/Navigate/Index.vue";
import QuestScreenDetailRewards from "#src/components/Quest/Screen/Detail/Rewards/Index.vue";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QUEST_DIVIDER_FILL } from "#src/services/quest/constants";
import { getQuestCounter } from "#src/services/quest/getQuestCounter";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { OrnamentDivider } from "genshin-interface";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The quest selected, whose step, journal and rewards the pane shows
  quest: Quest;
  // The series the quests in progress belong to, the one the selected quest is in holding its journal and rewards
  questChapters: QuestChapter[];
  // How far each quest in progress stands in its steps, by quest id
  questProgressMap: ReadonlyMap<string, QuestProgress>;
  // The quests' own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
  // The quest being navigated to, "" with none
  trackedQuestId: string;
}

const { quest, questChapters, questProgressMap } = defineProps<Props>();
const emit = defineEmits<{ navigate: [questId: string] }>();
const selectedChapter = computed(() => questChapters.find(({ questIds }) => questIds.includes(quest.id)));
// The selected quest's step, and how far its first counted objective has come
const questStep = computed(() => {
  const { objectiveCounts, stepIndex } = questProgressMap.get(quest.id) ?? { objectiveCounts: [], stepIndex: 0 };
  const step = quest.steps[stepIndex];
  if (!step) return undefined;
  return { counter: getQuestCounter(step, objectiveCounts), textId: step.textId };
});
</script>

<template>
  <div class="details">
    <p class="detail-title" aria-level="1" role="heading">{{ textMap[quest.titleTextId] }}</p>
    <MenuGlyph class="place" :glyph="QuestGlyphMap[QuestGlyph.Place]" />
    <template v-if="selectedChapter">
      <p class="journal">{{ textMap[selectedChapter.journalTextId] ?? "" }}</p>
      <span class="journal-emblem" />
    </template>
    <span class="divider" />
    <div class="rule">
      <OrnamentDivider :fill="QUEST_DIVIDER_FILL" is-hairline-hidden is-middle-hidden />
    </div>
    <p v-if="questStep" class="step">
      <MenuGlyph class="objective" :glyph="QuestGlyphMap[QuestGlyph.ObjectiveRing]" />
      <MenuGlyph class="objective" :glyph="QuestGlyphMap[QuestGlyph.ObjectiveCore]" />
      <span>{{ textMap[questStep.textId] }}</span>
      <span>{{ questStep.counter }}</span>
    </p>
    <p class="description">{{ textMap[quest.descriptionTextId] }}</p>
    <QuestScreenDetailRewards v-if="selectedChapter" :chapter="selectedChapter" :game-text />
    <QuestScreenDetailNavigate
      :game-text
      :quest-id="quest.id"
      :tracked-quest-id
      @navigate="(questId) => emit('navigate', questId)"
    />
  </div>
</template>

<style scoped>
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

/* Its capitals' tops at 128.5, spaced out to the still's line width */
.detail-title {
  position: absolute;
  top: calc(var(--unit) * 123.6);
  left: calc(var(--unit) * 1);
  color: #ede8e0;
  font-size: calc(var(--unit) * 35);
  letter-spacing: calc(var(--unit) * 2.17);
  line-height: calc(var(--unit) * 35);
  white-space: nowrap;
}

.place {
  color: #d2bfa2;
}

/* Its capitals' tops at 176.5, ending 17 short of the emblem */
.journal {
  position: absolute;
  top: calc(var(--unit) * 173.8);
  right: calc(var(--unit) * 61);
  color: #d1be9a;
  font-size: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 1.15);
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

.divider {
  position: absolute;
  height: calc(var(--unit) * 2);
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
  padding: calc(var(--unit) * 15.4) calc(var(--unit) * 13) 0 calc(var(--unit) * 54);
  background: rgb(0 0 0 / 0.1);
  color: #ece7e1;
  font-size: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 1.4);
  line-height: calc(var(--unit) * 26);
  justify-content: space-between;
}

.objective {
  color: #cdc0a4;
}

/* Its first line's capitals' tops at 319 */
.description {
  position: absolute;
  top: calc(var(--unit) * 314.7);
  left: calc(var(--unit) * 1);
  width: calc(var(--unit) * 880);
  color: #ede7df;
  font-size: calc(var(--unit) * 27);
  letter-spacing: calc(var(--unit) * 0.96);
  line-height: calc(var(--unit) * 30);
}

/* The shared divider's two ends laid over the column's own translucent hairline, the left one 33.5 out past the
   column's left and the right one 32 past its right, their centre 220 down, their tips on the hairline */
.rule {
  position: absolute;
  top: calc(var(--unit) * 205);
  right: calc(var(--unit) * -32);
  left: calc(var(--unit) * -33.5);
}
</style>
