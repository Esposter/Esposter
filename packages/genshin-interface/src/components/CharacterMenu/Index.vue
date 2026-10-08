<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";
import type { CharacterMenuTab } from "#src/models/CharacterMenuTab";

import { CharacterMenuTabs } from "#src/models/CharacterMenuTab";

interface Props {
  // The player's characters, across the screen's top in the order given
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
  <!-- The character screen's frame: the characters across the top with one chosen, its name at the top left, the tabs
       down the left with the open one lit, and the open tab's panel down the right -->
  <div class="character-menu">
    <div class="head" />
    <ul class="characters">
      <li v-for="{ id, name } of characters" :key="id">
        <button class="character" :aria-pressed="id === characterId" type="button" @click="characterId = id">
          {{ name }}
        </button>
      </li>
    </ul>
    <p class="breadcrumb">{{ characterName }}</p>
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
/* Measured off the English PC client's character screen at 21:9 (references/character-attributes-session.png, 154.4
   seconds), in units: a pixel of that frame at 1440 high is 0.75 units. The portraits sit 96 units apart from their
   centre at 643, the tabs' rows on a 69-unit pitch from 154, the panel's left edge at 2057 and its right margin at 195.
   The background is Geo's element tint, sampled there, and each element has its own, so it stays provisional */
.character-menu {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 55%, rgb(175 149 68), rgb(106 82 36));
  color: #fff;
}

/* Provisional: the band across the top, a darker strip over the scene with the name and the portraits on it */
.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 93);
  background: linear-gradient(rgb(40 28 10 / 0.5), rgb(40 28 10 / 0.3));
}

.characters,
.tabs {
  position: absolute;
  margin: 0;
  padding: 0;
  list-style: none;
}

.characters {
  top: calc(var(--unit) * 12.5);
  left: calc(var(--unit) * 608);
  display: flex;
  gap: calc(var(--unit) * 27);
  overflow-x: auto;
}

/* Provisional: the portraits, which the frame draws as the game's own art once an asset is settled, until then a circle
   with the name. The chosen one's cyan underline sits 79 units below the top of its portrait */
.character {
  position: relative;
  display: grid;
  width: calc(var(--unit) * 69);
  height: calc(var(--unit) * 69);
  flex: none;
  padding: 0;
  border: calc(var(--unit) * 3) solid #9bbf4b;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.15);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 11);
  place-items: center;
}

.character[aria-pressed="true"] {
  border-color: #7fd6e0;
}

.character[aria-pressed="true"]::after {
  position: absolute;
  top: calc(var(--unit) * 79);
  left: calc(var(--unit) * -13.5);
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 4);
  background: #6fc9dc;
  content: "";
}

.breadcrumb {
  position: absolute;
  top: calc(var(--unit) * 29);
  left: calc(var(--unit) * 216);
  margin: 0;
  color: #e6d6a8;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 36);
}

/* The rows sit on the game's 69-unit pitch, the first's centre at 154 units */
.tabs {
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 165);
  width: calc(var(--unit) * 400);
}

.tabs li {
  height: calc(var(--unit) * 69);
}

/* The words start 216 units from the frame's left, the diamond is centred at 196, and the open tab is bold white with no
   pill behind it, as the frame shows it */
.tab {
  position: relative;
  display: block;
  width: 100%;
  height: calc(var(--unit) * 56);
  margin-top: calc(var(--unit) * 6.5);
  padding: 0 0 0 calc(var(--unit) * 51);
  border: none;
  border-radius: calc(var(--unit) * 28);
  background: transparent;
  color: rgb(236 229 216 / 0.6);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 40);
  font-weight: 600;
  line-height: calc(var(--unit) * 56);
  text-align: start;
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

/* The game's diamond marks each row, centred at 196 units from the frame's left */
.tab::before {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 27.5);
  width: calc(var(--unit) * 8);
  height: calc(var(--unit) * 8);
  background: currentcolor;
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

.tab[aria-pressed="true"] {
  color: #fff;
  font-weight: 700;
}

/* The panel's left edge sits at 2057 units of the 2580-unit frame and its right margin at 195 units */
.panel {
  position: absolute;
  top: calc(var(--unit) * 124);
  right: calc(var(--unit) * 195);
  bottom: calc(var(--unit) * 40);
  width: calc(var(--unit) * 330);
  overflow-y: auto;
}
</style>
