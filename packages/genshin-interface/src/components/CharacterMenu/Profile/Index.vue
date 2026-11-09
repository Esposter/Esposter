<script setup lang="ts">
import type { CharacterMenuProfileEntry } from "#src/models/CharacterMenuProfileEntry";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The character's stories and then its voice-overs, each in the order the game lists them, the first one open at the start
  entries: CharacterMenuProfileEntry[];
  // The name of the character's namecard once its Friendship holds it, empty until then
  namecardName: string;
}

const { entries } = defineProps<Props>();
const entryIndex = ref(0);
const selectedEntry = computed(() => entries[entryIndex.value]);
</script>

<template>
  <!-- The Profile tab's panel: the stories down its left, each by its title, and the chosen one's title and
       text down its right. A locked story shows its unlock line as its title, or its plain title when no level
       opens it, with no text under it. The namecard the Friendship holds is a plate of its name under the
       stories, its art not drawn yet -->
  <div class="profile">
    <div class="entries-column">
      <ul class="entries">
        <li v-for="(entry, index) of entries" :key="index">
          <GameButton
            class="entry"
            :aria-pressed="index === entryIndex"
            :data-locked="entry.isLocked"
            :kind="GameButtonKind.Row"
            tip=""
            @click="entryIndex = index"
          >
            {{ entry.title }}
          </GameButton>
        </li>
      </ul>
      <p v-if="namecardName" class="namecard">{{ namecardName }}</p>
    </div>
    <article v-if="selectedEntry" class="story">
      <h2 class="title">{{ selectedEntry.title }}</h2>
      <p class="text">{{ selectedEntry.text }}</p>
    </article>
  </div>
</template>

<style scoped>
/* Provisional: the list and the text share the panel as two columns, the list a third of its width. The frame's sizes and
   colours are not measured yet, so they wait on the Profile tab's comparison */
.profile {
  display: flex;
  width: 100%;
  height: 100%;
  color: #fff;
}

.entries-column {
  display: flex;
  flex: 0 0 calc(var(--unit) * 260);
  flex-direction: column;
}

.entries {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.entry {
  display: block;
  width: 100%;
  margin-bottom: calc(var(--unit) * 8);
  color: color-mix(in srgb, v-bind(GAME_CREAM) 70%, transparent);
  cursor: inherit;
  font: inherit;
  text-align: start;
}

.entry,
.namecard {
  border: calc(var(--unit) * 1) solid color-mix(in srgb, v-bind(GAME_CREAM) 40%, transparent);
  border-radius: calc(var(--unit) * 4);
  background: rgb(20 40 70 / 0.5);
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
}

.entry[aria-pressed="true"] {
  border-color: #7fd6e0;
  color: #fff;
}

.entry[data-locked="true"] {
  opacity: 0.6;
}

.namecard {
  margin: calc(var(--unit) * 16) 0 0;
}

.story {
  flex: 1;
  margin-left: calc(var(--unit) * 24);
  overflow-y: auto;
}

.title {
  margin: 0 0 calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 30);
  font-weight: 700;
}

.text {
  margin: 0;
  font-size: calc(var(--unit) * 22);
  line-height: 1.6;
  white-space: pre-line;
}
</style>
