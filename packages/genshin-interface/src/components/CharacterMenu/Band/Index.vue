<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";

interface Props {
  // The chosen character's id, whose name the band's words end with
  characterId: number;
  // The player's characters, across the screen's top in the order given
  characters: CharacterMenuEntry[];
  // The element mark's path drawn at the name's left, the chosen character's element, empty where it has none yet
  elementMarkPath: string;
  // The chosen character's element in the reader's language, which the band's name is set after, empty if none
  elementName: string;
}

const { characterId, characters, elementMarkPath, elementName } = defineProps<Props>();
const characterName = computed(() => characters.find(({ id }) => id === characterId)?.name ?? "");
</script>

<template>
  <!-- The band's words: the element's name and the character's, split by the screen's own slash -->
  <p class="breadcrumb">{{ elementName ? `${elementName} / ${characterName}` : characterName }}</p>
  <svg v-if="elementMarkPath" class="element" viewBox="0 0 1600 1600" aria-hidden="true">
    <path
      class="frame"
      d="M800 0 L1014 283 L1366 234 L1317 586 L1600 800 L1317 1014 L1366 1366 L1014 1317 L800 1600 L586 1317 L234 1366 L283 1014 L0 800 L283 586 L234 234 L586 283 Z"
    />
    <path :d="elementMarkPath" transform="translate(400 400) scale(0.5)" />
  </svg>
</template>

<style scoped>
/* The game's cap height at the substitute face's size, its words letter-spaced out to the line's width, which the face
   sets narrower at one cap height */
.breadcrumb {
  position: absolute;
  top: calc(var(--unit) * 29);
  left: calc(var(--unit) * 216);
  margin: 0;
  color: #e6d6a8;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1.5);
  line-height: calc(var(--unit) * 36);
}

/* The element's emblem at the band's left: a silver star 97.5 units across, its tips on the frame's top and bottom
   edges, with the element's mark drawn at its centre */
.element {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 99.75);
  width: calc(var(--unit) * 97.5);
  height: calc(var(--unit) * 97.5);
  fill: #e0a83c;
}

.element .frame {
  fill: #d8d4cf;
}
</style>
