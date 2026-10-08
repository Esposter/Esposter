<script setup lang="ts">
import { readCharacterTerms } from "#src/services/character/readCharacterTerms";

interface Props {
  characterId: string;
  characterPackBaseUrl: string;
}

const { characterId, characterPackBaseUrl } = defineProps<Props>();
const terms = ref<string>();
const isFailed = ref(false);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject
readCharacterTerms(characterPackBaseUrl, characterId).match(
  (text) => {
    terms.value = text;
  },
  () => {
    isFailed.value = true;
  },
);
</script>

<template>
  <section>
    <p v-if="isFailed">The model's terms could not be loaded.</p>
    <pre v-else-if="terms">{{ terms }}</pre>
  </section>
</template>
