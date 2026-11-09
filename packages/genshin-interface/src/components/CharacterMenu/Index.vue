<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";
import type { CharacterMenuTab } from "#src/models/CharacterMenuTab";

import Band from "#src/components/CharacterMenu/Band/Index.vue";
import Characters from "#src/components/CharacterMenu/Characters/Index.vue";
import Keys from "#src/components/CharacterMenu/Keys/Index.vue";
import Steps from "#src/components/CharacterMenu/Steps/Index.vue";
import TabColumn from "#src/components/CharacterMenu/TabColumn/Index.vue";

interface Props {
  // The player's characters, across the screen's top in the order given
  characters: CharacterMenuEntry[];
  // The element mark's path drawn at the name's left, the chosen character's element, empty where it has none yet
  elementMarkPath: string;
  // The chosen character's element in the reader's language, which the band's name is set after, empty if none
  elementName: string;
  // Whether the device's main pointer is a finger, which has no keys for the tab keys to hint at
  isTouch: boolean;
  // Each tab's name in the reader's language
  tabLabels: Record<CharacterMenuTab, string>;
}

defineSlots<{ default: () => unknown }>();
const characterId = defineModel<number>("characterId", { required: true });
const tab = defineModel<CharacterMenuTab>("tab", { required: true });
const { characters } = defineProps<Props>();
// The characters either side of the chosen one, the list wrapping round at its ends
const steps = computed(() => {
  const index = characters.findIndex(({ id }) => id === characterId.value);
  const getStep = (step: number) => characters[(index + step + characters.length) % characters.length];
  return { next: getStep(1), previous: getStep(-1) };
});
</script>

<template>
  <!-- The character screen's frame: the characters across the top with one chosen, its name at the top left, the tabs
       down the left with the open one lit, and the open tab's panel down the right -->
  <div class="character-menu" :data-tab="tab">
    <div class="head" />
    <Characters v-model:character-id="characterId" :characters />
    <Band :character-id :characters :element-mark-path :element-name />
    <!-- The keys stepping through the tabs, W up and S down, beside the first; the keys stepping through the characters,
         Q and E, either side of the row; a finger has no keys to press -->
    <Keys v-if="!isTouch" />
    <TabColumn v-model:tab="tab" :tab-labels />
    <section class="panel" :aria-label="tabLabels[tab]"><slot /></section>
    <Steps v-if="characters.length > 1" :next="steps.next" :previous="steps.previous" @step="characterId = $event" />
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

/* The band across the top, the name and the portraits on it, a veil 96 units deep that darkens the scene 40 hundredths
   at its top edge and 22 hundredths at its foot, as the frame's band measures against the scene under it */
.head {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 96);
  background: linear-gradient(rgb(0 0 0 / 0.4), rgb(0 0 0 / 0.22));
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
