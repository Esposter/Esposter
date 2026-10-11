<script setup lang="ts">
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { readCharacterTerms } from "#src/services/character/readCharacterTerms";

interface Props {
  // Where the character's pack is read from, the browser's kept copy or the host's
  characterPackReader: CharacterPackReader;
}

const { characterPackReader } = defineProps<Props>();
const terms = ref("");
const isFailed = ref(false);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
readCharacterTerms(characterPackReader).match(
  (text) => {
    terms.value = text;
  },
  () => {
    isFailed.value = true;
  },
);
</script>

<template>
  <!-- One element, so it takes the styles of the panel its host lays it in -->
  <p v-if="isFailed">The model's terms could not be loaded.</p>
  <pre v-else-if="terms">{{ terms }}</pre>
</template>
