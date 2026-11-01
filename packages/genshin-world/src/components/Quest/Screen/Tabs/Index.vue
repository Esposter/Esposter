<script setup lang="ts">
import type { QuestCategory } from "#src/models/quest/QuestCategory";
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QUEST_CATEGORIES } from "#src/services/quest/constants";
import { QuestCategoryGameTextKeyMap } from "#src/services/quest/QuestCategoryGameTextKeyMap";
import { QuestCategoryGlyphMap } from "#src/services/quest/QuestCategoryGlyphMap";
import { QuestCategoryShadeGlyphMap } from "#src/services/quest/QuestCategoryShadeGlyphMap";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { GameTextKey } from "genshin-text";

interface Props {
  // The tab open, none for the first, which lists every quest
  category?: QuestCategory;
  // The game's words in the reader's language
  gameText: GameText;
}

defineProps<Props>();
const emit = defineEmits<{ select: [questCategory?: QuestCategory] }>();
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      class="tab"
      :aria-label="gameText[GameTextKey.QuestsInProgress]"
      :aria-selected="!category"
      role="tab"
      type="button"
      @click="emit('select')"
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
      @click="emit('select', questCategory)"
    >
      <MenuGlyph class="shade" :glyph="QuestCategoryShadeGlyphMap[questCategory]" />
      <MenuGlyph :glyph="QuestCategoryGlyphMap[questCategory]" />
    </button>
  </div>
</template>

<style scoped>
.tab {
  margin: 0;
  padding: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
  position: relative;
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 96);
  background: none;
  color: #bebaba;
}

.tabs {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 720);
  display: flex;
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
</style>
