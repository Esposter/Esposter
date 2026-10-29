<script setup lang="ts">
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { QuestCategory } from "#src/models/quest/QuestCategory";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QuestCategoryGlyphMap } from "#src/services/quest/QuestCategoryGlyphMap";
import { QuestCategoryShadeGlyphMap } from "#src/services/quest/QuestCategoryShadeGlyphMap";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";

interface Props {
  // How far the quest's objective stands from the player in the reader's words, "" with no place to go to
  distance: string;
  // Whether it is a daily commission, which ends on the commission's star rather than a place's pin
  isCommission?: boolean;
  // The quest's title in the reader's language
  title: string;
}

const { distance, isCommission, title } = defineProps<Props>();
</script>

<template>
  <!-- One quest of the quest screen's list: its title over how far it stands, and its mark at its end, the commission's
       Star drawn as the Commission tab's mark in its own purples -->
  <button class="quest-row" type="button">
    <span class="title">{{ title }}</span>
    <span v-if="distance" class="distance">{{ distance }}</span>
    <span class="mark" aria-hidden="true">
      <svg v-if="isCommission" class="commission" viewBox="0 0 60 64">
        <path
          v-for="(path, index) of QuestCategoryShadeGlyphMap[QuestCategory.Commission].paths"
          :key="index"
          class="commission-shade"
          :d="path"
        />
        <path v-for="(path, index) of QuestCategoryGlyphMap[QuestCategory.Commission].paths" :key="index" :d="path" />
      </svg>
      <MenuGlyph v-else :glyph="QuestGlyphMap[QuestGlyph.RowPlace]" />
    </span>
  </button>
</template>

<style scoped>
/* Its fill fitted against the world in the gaps between rows on the quest screen's still, the same over its three
   Commissions and a series' quests. Its font size is its title's, which a series' quests draw a size larger */
.quest-row {
  position: relative;
  display: block;
  width: 100%;
  height: calc(var(--unit) * 76);
  margin: 0;
  padding: 0;
  border: none;
  background: rgb(54 67 86 / 0.77);
  color: #ece8e3;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-align: start;
}

/* Their words spaced out to the still's line width, about 0.8 a letter over the stand-in face */
.title,
.distance {
  position: absolute;
  left: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 0.8);
  white-space: nowrap;
}

/* Its capitals' tops 18 below the row's, a capital's top 0.141 of the size below its line's when the line is as high */
.title {
  top: calc(var(--unit) * 18 - 0.141em);
  line-height: 1;
}

/* Its figures' tops 47 below the row's */
.distance {
  top: calc(var(--unit) * 44.5);
  color: #939aa4;
  font-size: calc(var(--unit) * 18);
  line-height: 1;
}

.mark {
  position: absolute;
  top: 0;
  right: calc(var(--unit) * 26);
  width: calc(var(--unit) * 48);
  height: 100%;
  color: #938f84;
}

/* The tab's mark at 0.89 of its size, its ink 44 across as the still's star is, centred 23 in from the mark's left */
.commission {
  position: absolute;
  top: calc(var(--unit) * 9.4);
  left: calc(var(--unit) * -3.8);
  width: calc(var(--unit) * 53.4);
  height: calc(var(--unit) * 57);
  fill: #c1a1ff;
}

.commission-shade {
  fill: #5e478c;
}
</style>
