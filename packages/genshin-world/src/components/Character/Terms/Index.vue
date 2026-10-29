<script setup lang="ts">
import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { getCharacterPackReader } from "#src/services/character/getCharacterPackReader";
import { readCharacterTerms } from "#src/services/character/readCharacterTerms";

interface Props {
  // The character the screen shows, whose pack's terms are shown beside it
  characterId: number;
  // The readers of the published character packs by the character each is of
  characterPackReaders: ReadonlyMap<number, CharacterPackReader>;
}

const { characterId, characterPackReaders } = defineProps<Props>();
const terms = ref("");
const isFailed = ref(false);
const characterPackReader = getCharacterPackReader(characterPackReaders, characterId);
// The terms are the drawn model's, the Traveler's when the index lists none for the character, so with no reader at all it shows none
if (characterPackReader)
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
