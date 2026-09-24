<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { findValue, occurrences, replaceValue } = storeToRefs(findReplaceStore);
const findReplace = useFindReplace();
</script>

<template>
  <UiButton :disabled="occurrences.length === 0" @click="findReplace(findValue, replaceValue)">Replace all</UiButton>
</template>
