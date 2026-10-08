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
/* Measured off the English PC client's character screen at 21:9, its Attributes tab on the session recording's frame at
   154 seconds (references/character-attributes-session.png), in units: a pixel of that frame at 1440 high is 0.75 units.
   The background is Geo's element tint, sampled there, and each element has its own, so it stays provisional */
.character-menu {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 56% 48%, rgb(180 151 72), rgb(120 96 40));
  color: #fff;
}

.characters,
.tabs {
  position: absolute;
  margin: 0;
  padding: 0;
  list-style: none;
}

.characters {
  top: calc(var(--unit) * 19);
  left: 50%;
  display: flex;
  gap: calc(var(--unit) * 7.5);
  transform: translateX(-50%);
  overflow-x: auto;
}

/* Provisional: the portraits, which the frame draws as the game's own art once an asset is settled, until then a circle
   with the name */
.character {
  display: grid;
  width: calc(var(--unit) * 60);
  height: calc(var(--unit) * 60);
  padding: 0;
  border: calc(var(--unit) * 3) solid transparent;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.15);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 12);
  place-items: center;
}

.character[aria-pressed="true"] {
  border-color: #fff;
}

.breadcrumb {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 218);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

/* The rows sit on the game's 69-unit pitch, the first's centre at 154 units */
.tabs {
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 165);
  width: calc(var(--unit) * 352);
}

.tabs li {
  height: calc(var(--unit) * 69);
}

/* The open tab's pill is 56 units high and 352 wide, from 165 units. The game slides it between rows; that motion is
   not measured yet, so the pill sits on its row */
.tab {
  position: relative;
  display: block;
  width: 100%;
  height: calc(var(--unit) * 56);
  margin-top: calc(var(--unit) * 6.5);
  padding: 0 0 0 calc(var(--unit) * 60);
  border: none;
  border-radius: calc(var(--unit) * 28);
  background: transparent;
  color: rgb(255 255 255 / 0.6);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 36);
  font-weight: 600;
  line-height: calc(var(--unit) * 56);
  text-align: start;
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

/* The game's diamond marks each row, centred at 195 units from the frame's left */
.tab::before {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 26);
  width: calc(var(--unit) * 8);
  height: calc(var(--unit) * 8);
  background: currentcolor;
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

.tab[aria-pressed="true"] {
  background: rgb(255 255 255 / 0.15);
  color: #fff;
  font-weight: 700;
}

/* The panel's left edge sits at 2057 units of the 2580-unit frame, so it is anchored to the right edge */
.panel {
  position: absolute;
  top: calc(var(--unit) * 124);
  right: calc(var(--unit) * 199);
  bottom: calc(var(--unit) * 40);
  width: calc(var(--unit) * 324);
  overflow-y: auto;
}
</style>
