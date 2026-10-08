<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";
import type { CharacterMenuTab } from "#src/models/CharacterMenuTab";

import { CharacterMenuTabs } from "#src/models/CharacterMenuTab";

interface Props {
  // The player's characters, down the screen's left
  characters: CharacterMenuEntry[];
  // Each tab's name in the reader's language
  tabLabels: Record<CharacterMenuTab, string>;
}

defineSlots<{ default: () => unknown }>();
const characterId = defineModel<number>("characterId", { required: true });
const tab = defineModel<CharacterMenuTab>("tab", { required: true });
const { characters, tabLabels } = defineProps<Props>();
const characterName = computed(() => characters.find(({ id }) => id === characterId.value)?.name ?? "");
</script>

<template>
  <!-- The character screen's frame, the open tab's panel inside it: the characters down the left, one chosen, the open
       Tab's name over the chosen character's at the top left, and the tabs down the right beside the open one's panel -->
  <div class="character-menu">
    <ul class="characters">
      <li v-for="{ id, name } of characters" :key="id">
        <button class="character" :aria-pressed="id === characterId" type="button" @click="characterId = id">
          {{ name }}
        </button>
      </li>
    </ul>
    <hgroup class="heading">
      <h1 class="tab-name">{{ tabLabels[tab] }}</h1>
      <p class="character-name">{{ characterName }}</p>
    </hgroup>
    <ul class="tabs">
      <li v-for="menuTab of CharacterMenuTabs" :key="menuTab">
        <button class="tab" :aria-pressed="menuTab === tab" type="button" @click="tab = menuTab">
          {{ tabLabels[menuTab] }}
        </button>
      </li>
    </ul>
    <section class="panel" :aria-label="tabLabels[tab]"><slot /></section>
  </div>
</template>

<style scoped>
/* Provisional: every place, size and colour here, until the character screen's passes measure them off a recording of
   The English client at 1080 high */
.character-menu {
  position: absolute;
  inset: 0;
  background: rgb(28 32 42 / 0.92);
  color: #ece5d8;
}

.characters,
.tabs {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  list-style: none;
}

.characters {
  position: absolute;
  top: calc(var(--unit) * 140);
  bottom: calc(var(--unit) * 40);
  left: calc(var(--unit) * 32);
  gap: calc(var(--unit) * 16);
  overflow-y: auto;
}

.character {
  display: grid;
  width: calc(var(--unit) * 104);
  height: calc(var(--unit) * 104);
  padding: 0;
  border: calc(var(--unit) * 3) solid transparent;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.12);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 18);
  place-items: center;
}

.character[aria-pressed="true"] {
  border-color: #ece5d8;
}

.heading {
  position: absolute;
  top: calc(var(--unit) * 36);
  left: calc(var(--unit) * 168);
  margin: 0;
}

.tab-name,
.character-name {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
}

.tab-name {
  font-size: calc(var(--unit) * 26);
  opacity: 0.7;
}

.character-name {
  font-size: calc(var(--unit) * 44);
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 140);
  right: calc(var(--unit) * 48);
  width: calc(var(--unit) * 220);
  gap: calc(var(--unit) * 8);
}

.tab {
  width: 100%;
  padding: calc(var(--unit) * 14) calc(var(--unit) * 20);
  border: none;
  border-radius: calc(var(--unit) * 32);
  background: transparent;
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 26);
  text-align: start;
}

.tab[aria-pressed="true"] {
  background: #ece5d8;
  color: #3b4255;
}

.panel {
  position: absolute;
  top: calc(var(--unit) * 140);
  right: calc(var(--unit) * 300);
  bottom: calc(var(--unit) * 40);
  width: calc(var(--unit) * 560);
  overflow-y: auto;
}
</style>
