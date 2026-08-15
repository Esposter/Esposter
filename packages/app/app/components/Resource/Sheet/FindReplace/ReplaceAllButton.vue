<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { findValue, occurrences, replaceValue } = storeToRefs(findReplaceStore);
const findReplace = useFindReplace();
</script>

<template>
  <v-btn
    :disabled="occurrences.length === 0"
    density="compact"
    text="Replace All"
    variant="text"
    @click="findReplace(findValue, replaceValue)"
  />
</template>
