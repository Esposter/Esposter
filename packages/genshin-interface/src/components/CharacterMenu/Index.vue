<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";
import type { CharacterMenuTab } from "#src/models/CharacterMenuTab";

import { CharacterMenuTabs } from "#src/models/CharacterMenuTab";
import { computed } from "vue";

interface Props {
  // The element mark's path drawn at the name's left, the chosen character's element, none where it has none yet
  elementMarkPath?: string;
  // The player's characters, across the screen's top in the order given
  characters: CharacterMenuEntry[];
  // Each tab's name in the reader's language
  tabLabels: Record<CharacterMenuTab, string>;
}

defineSlots<{ default: () => unknown }>();
const characterId = defineModel<number>("characterId", { required: true });
const tab = defineModel<CharacterMenuTab>("tab", { required: true });
const { characters, elementMarkPath, tabLabels } = defineProps<Props>();
const characterName = computed(() => characters.find(({ id }) => id === characterId.value)?.name ?? "");
// The characters either side of the chosen one, the list wrapping round at its ends, which the arrows at the frame's
// Left and right edges step to
const steps = computed(() => {
  const index = characters.findIndex(({ id }) => id === characterId.value);
  const getStep = (step: number) => characters[(index + step + characters.length) % characters.length];
  return [
    { character: getStep(-1), className: "previous" },
    { character: getStep(1), className: "next" },
  ];
});
</script>

<template>
  <!-- The character screen's frame: the characters across the top with one chosen, its name at the top left, the tabs
       down the left with the open one lit, and the open tab's panel down the right -->
  <div class="character-menu" :data-tab="tab">
    <div class="head" />
    <ul class="characters">
      <li v-for="{ id, name } of characters" :key="id">
        <button class="character" :aria-pressed="id === characterId" type="button" @click="characterId = id">
          {{ name }}
        </button>
      </li>
    </ul>
    <p class="breadcrumb">{{ characterName }}</p>
    <svg v-if="elementMarkPath" class="element" viewBox="0 0 1600 1600" aria-hidden="true">
      <path :d="elementMarkPath" />
    </svg>
    <!-- The keys stepping through the tabs, W up and S down, beside the first -->
    <div class="tab-keys" aria-hidden="true">
      <kbd class="key">W</kbd>
      <kbd class="key">S</kbd>
    </div>
    <ul class="tabs">
      <li v-for="menuTab of CharacterMenuTabs" :key="menuTab">
        <button class="tab" :aria-pressed="menuTab === tab" type="button" @click="tab = menuTab">
          {{ tabLabels[menuTab] }}
        </button>
      </li>
    </ul>
    <section class="panel" :aria-label="tabLabels[tab]"><slot /></section>
    <template v-if="characters.length > 1">
      <button
        v-for="{ character, className } of steps"
        :key="className"
        :class="['step', className]"
        :aria-label="character?.name"
        type="button"
        @click="characterId = character?.id ?? characterId"
      >
        <!-- The arrow's head and the diamond in its notch, in the reference's own pixels -->
        <svg viewBox="0 0 43 55" aria-hidden="true">
          <path class="arrow" d="M31 0 L0 27.5 L31 55 L31 42 L16 27.5 L31 13 Z" />
          <path class="mark" d="M31 16.5 L42 27.5 L31 38.5 L20 27.5 Z M31 22 L25.5 27.5 L31 33 L36.5 27.5 Z" />
          <path class="mark" d="M31 25.5 L33 27.5 L31 29.5 L29 27.5 Z" />
        </svg>
      </button>
    </template>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's character screen at 21:9 (captures/session-2.mp4, a frame per tab from 155 to
   159 seconds), in units: a pixel of that frame at 1440 high is 0.75 units. The game's exports hold the screen's root
   alone, its contents a prefab loaded at run time, so every place here is read off the frames. The portraits sit 96
   units apart from their centre at 643, the panel's left edge at 2057 and its right margin at 195. The frame draws no
   scene: the world's screen lays one behind it */
.character-menu {
  position: absolute;
  inset: 0;
  color: #fff;
}

/* The band across the top, the name and the portraits on it, a veil 96 units deep that keeps 78 hundredths of the scene
   under it all the way down, as the frame's scene measures above and below its edge */
.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 96);
  background: rgb(0 0 0 / 0.22);
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

/* The element's mark just left of the name, its size and place provisional until the parity pass measures them off the
   frame, its colour the name's */
.element {
  position: absolute;
  top: calc(var(--unit) * 29);
  left: calc(var(--unit) * 168);
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  fill: #e6d6a8;
}

/* The tabs down the left, measured off each tab's own frame of the recording (155 to 159 seconds): the rows on a
   69.6-unit pitch, the first's words centred 155.8 units down. Each row spans the column from the frame's left, so its
   word and its diamond are placed from the frame's own edge */
.tabs {
  top: calc(var(--unit) * 121);
  left: 0;
  width: calc(var(--unit) * 560);
}

.tabs li {
  height: calc(var(--unit) * 69.6);
}

/* A closed tab's word starts 216 units in, its ascenders 25.5 units tall in a cream a little short of white, letter-spaced
   out to the game's width, with a faint shadow round it */
.tab {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0 0 0 calc(var(--unit) * 216);
  border: none;
  background: transparent;
  color: rgb(206 197 176);
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 34.5);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.95);
  line-height: calc(var(--unit) * 69.6);
  text-align: start;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.2);
}

/* A closed tab's diamond, 15 units corner to corner and centred 196.9 units in, the word's cream at half strength */
.tab::before {
  position: absolute;
  top: calc(50% - var(--unit) * 1.3);
  left: calc(var(--unit) * 191.6);
  width: calc(var(--unit) * 10.6);
  height: calc(var(--unit) * 10.6);
  background: rgb(236 229 216 / 0.5);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

/* The open tab's word is a fifth larger and near white, 9.75 units further in, blooming into the light behind it */
.tab[aria-pressed="true"] {
  z-index: 0;
  padding-left: calc(var(--unit) * 225.75);
  color: rgb(244 243 235);
  font-size: calc(var(--unit) * 41.4);
  letter-spacing: calc(var(--unit) * 2.34);
  text-shadow:
    0 0 calc(var(--unit) * 4) rgb(255 248 230 / 0.8),
    0 0 calc(var(--unit) * 12) rgb(255 240 200 / 0.5);
}

/* Its diamond is a faint outline 28.5 units corner to corner on the same centre, the part of it right of a line 4.5 units
   past its centre filled near white, a head pointing right, with a light rising towards it from the left corner */
.tab[aria-pressed="true"]::before {
  top: 50%;
  left: calc(var(--unit) * 186.4);
  box-sizing: border-box;
  width: calc(var(--unit) * 20.2);
  height: calc(var(--unit) * 20.2);
  border: calc(var(--unit) * 1.6) solid rgb(236 229 216 / 0.45);
  background: linear-gradient(45deg, transparent 30%, rgb(255 250 240 / 0.45) 68.75%, rgb(236 231 219) 68.75%)
    padding-box;
}

/* Behind its word, a warm light from the word's start out to 517.5 units, a thin bright streak along the row's middle in
   a fainter haze, as the frame less its clean plate measures it */
.tab[aria-pressed="true"]::after {
  position: absolute;
  z-index: -1;
  top: 50%;
  left: calc(var(--unit) * 217.5);
  width: calc(var(--unit) * 300);
  height: calc(var(--unit) * 90);
  background:
    radial-gradient(
        closest-side,
        rgb(255 240 200 / 0.4),
        rgb(255 240 200 / 0.3) 35%,
        rgb(255 240 200 / 0.17) 55%,
        rgb(255 240 200 / 0.09) 75%,
        transparent 95%
      )
      center / 100% calc(var(--unit) * 18) no-repeat,
    radial-gradient(closest-side, rgb(255 240 200 / 0.14), rgb(255 240 200 / 0.08) 50%, transparent);
  content: "";
  transform: translateY(-50%);
}

/* The keys stepping through the tabs: white caps 30.75 by 25 units with dark letters, an arrow over the W and under the
   S, centred 148.9 units in from the frame's left */
.tab-keys {
  position: absolute;
  top: calc(var(--unit) * 126.75);
  left: calc(var(--unit) * 133.5);
  display: flex;
  width: calc(var(--unit) * 30.75);
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 3.5);
}

.tab-keys::before,
.tab-keys::after {
  width: calc(var(--unit) * 11.25);
  height: calc(var(--unit) * 6);
  background: #fdfdfd;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: "";
}

.tab-keys::after {
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.key {
  display: grid;
  width: 100%;
  height: calc(var(--unit) * 25);
  border-radius: calc(var(--unit) * 3);
  background: #fdfdfd;
  color: #2b2b2b;
  font: inherit;
  font-size: calc(var(--unit) * 20.5);
  font-weight: 600;
  line-height: 1;
  place-items: center;
}

/* The arrows stepping to the characters either side, centred down the frame's left and right edges, their heads 129.75
   units from the edge and their backs 153.75 */
.step {
  position: absolute;
  top: calc(50% - var(--unit) * 21);
  width: calc(var(--unit) * 32.25);
  height: calc(var(--unit) * 41.25);
  padding: 0;
  border: none;
  background: transparent;
  cursor: inherit;
}

.step svg {
  display: block;
  width: 100%;
  height: 100%;
}

.previous {
  left: calc(var(--unit) * 129.75);
}

.next {
  right: calc(var(--unit) * 129.75);
  transform: scaleX(-1);
}

.arrow {
  fill: rgb(236 229 216);
}

.mark {
  fill: rgb(236 229 216 / 0.5);
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

/* The Profile tab's stories and their text take the width the characters' row across the top leaves, from where it starts */
.character-menu[data-tab="Profile"] .panel {
  left: calc(var(--unit) * 608);
  width: auto;
}
</style>
